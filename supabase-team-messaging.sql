-- =============================================
-- MESSAGERIE D'ÉQUIPE
-- Conversations directes et canal commun, en temps réel
-- =============================================

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL DEFAULT 'direct' CHECK (kind IN ('direct', 'channel')),
  name TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversation_members (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, profile_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conv_members_profile ON conversation_members(profile_id);

-- ============================================
-- APPARTENANCE — sans récursion dans les règles d'accès
-- ============================================

CREATE OR REPLACE FUNCTION is_conversation_member(conv UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM conversation_members
     WHERE conversation_id = conv AND profile_id = auth.uid()
  );
$$;

-- ============================================
-- OUVRIR UNE CONVERSATION AVEC QUELQU'UN
-- ============================================

-- Renvoie la conversation directe existante entre deux membres, ou la crée.
CREATE OR REPLACE FUNCTION open_direct_conversation(p_other UUID)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  me UUID := auth.uid();
  conv UUID;
BEGIN
  IF me IS NULL OR p_other IS NULL OR me = p_other THEN
    RAISE EXCEPTION 'Destinataire invalide';
  END IF;

  SELECT c.id INTO conv
    FROM conversations c
    JOIN conversation_members a ON a.conversation_id = c.id AND a.profile_id = me
    JOIN conversation_members b ON b.conversation_id = c.id AND b.profile_id = p_other
   WHERE c.kind = 'direct'
   LIMIT 1;

  IF conv IS NOT NULL THEN RETURN conv; END IF;

  INSERT INTO conversations (kind, created_by) VALUES ('direct', me) RETURNING id INTO conv;
  INSERT INTO conversation_members (conversation_id, profile_id) VALUES (conv, me), (conv, p_other);
  RETURN conv;
END $$;

-- ============================================
-- À CHAQUE MESSAGE
-- ============================================

CREATE OR REPLACE FUNCTION on_message_sent()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  author_name TEXT;
  conv conversations;
  member RECORD;
  heading TEXT;
BEGIN
  SELECT full_name INTO author_name FROM profiles WHERE id = NEW.author_id;
  SELECT * INTO conv FROM conversations WHERE id = NEW.conversation_id;

  UPDATE conversations SET last_message_at = NEW.created_at WHERE id = NEW.conversation_id;
  -- L'auteur a forcément lu ce qu'il vient d'écrire
  UPDATE conversation_members
     SET last_read_at = NEW.created_at
   WHERE conversation_id = NEW.conversation_id AND profile_id = NEW.author_id;

  heading := CASE
    WHEN conv.kind = 'channel' THEN COALESCE(author_name, 'Quelqu''un') || ' a écrit dans ' || COALESCE(conv.name, 'le canal')
    ELSE COALESCE(author_name, 'Quelqu''un') || ' vous a écrit'
  END;

  FOR member IN
    SELECT cm.profile_id FROM conversation_members cm
     JOIN profiles p ON p.id = cm.profile_id
    WHERE cm.conversation_id = NEW.conversation_id
      AND p.is_active
      AND (NEW.author_id IS NULL OR cm.profile_id <> NEW.author_id)
  LOOP
    INSERT INTO notifications (recipient_id, actor_id, type, entity_type, entity_id, title, body, link)
    VALUES (member.profile_id, NEW.author_id, 'comment', 'project', NEW.conversation_id,
            heading, left(NEW.body, 160), '/dashboard/messages/' || NEW.conversation_id::TEXT);
  END LOOP;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_message_created ON messages;
CREATE TRIGGER on_message_created
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION on_message_sent();

-- ============================================
-- CANAL COMMUN
-- ============================================

DO $$
DECLARE conv UUID;
BEGIN
  SELECT id INTO conv FROM conversations WHERE kind = 'channel' AND name = 'Équipe';
  IF conv IS NULL THEN
    INSERT INTO conversations (kind, name) VALUES ('channel', 'Équipe') RETURNING id INTO conv;
  END IF;
  INSERT INTO conversation_members (conversation_id, profile_id)
  SELECT conv, id FROM profiles WHERE is_active
  ON CONFLICT DO NOTHING;
END $$;

-- Tout nouveau membre rejoint le canal commun
CREATE OR REPLACE FUNCTION join_team_channel()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE conv UUID;
BEGIN
  SELECT id INTO conv FROM conversations WHERE kind = 'channel' AND name = 'Équipe' LIMIT 1;
  IF conv IS NOT NULL THEN
    INSERT INTO conversation_members (conversation_id, profile_id)
    VALUES (conv, NEW.id) ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_profile_join_channel ON profiles;
CREATE TRIGGER on_profile_join_channel
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION join_team_channel();

-- ============================================
-- SÉCURITÉ — on ne lit que ses propres conversations
-- ============================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members read conversation" ON conversations;
CREATE POLICY "Members read conversation" ON conversations
  FOR SELECT USING (is_conversation_member(id));

DROP POLICY IF EXISTS "Members update conversation" ON conversations;
CREATE POLICY "Members update conversation" ON conversations
  FOR UPDATE USING (is_conversation_member(id)) WITH CHECK (is_conversation_member(id));

DROP POLICY IF EXISTS "Own membership read" ON conversation_members;
CREATE POLICY "Own membership read" ON conversation_members
  FOR SELECT USING (profile_id = auth.uid() OR is_conversation_member(conversation_id));

DROP POLICY IF EXISTS "Own membership update" ON conversation_members;
CREATE POLICY "Own membership update" ON conversation_members
  FOR UPDATE USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "Members read messages" ON messages;
CREATE POLICY "Members read messages" ON messages
  FOR SELECT USING (is_conversation_member(conversation_id));

DROP POLICY IF EXISTS "Members write messages" ON messages;
CREATE POLICY "Members write messages" ON messages
  FOR INSERT WITH CHECK (author_id = auth.uid() AND is_conversation_member(conversation_id));

DROP POLICY IF EXISTS "Author edits message" ON messages;
CREATE POLICY "Author edits message" ON messages
  FOR UPDATE USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "Author deletes message" ON messages;
CREATE POLICY "Author deletes message" ON messages
  FOR DELETE USING (author_id = auth.uid());

-- ============================================
-- TEMPS RÉEL
-- ============================================

DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE messages;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
