import { motion } from 'framer-motion'

export default function ContactForm() {
  return (
    <section className="py-24 md:py-32 px-6 bg-surface">
      <motion.div
        className="max-w-2xl mx-auto text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <span className="text-accent font-display font-semibold text-sm tracking-[0.2em] uppercase">
          Contact
        </span>
        <h2 className="font-display font-bold text-3xl md:text-4xl text-text-primary mt-4 mb-4">
          Un projet en tête ?
        </h2>
        <p className="text-text-secondary mb-8">
          Répondez à huit questions et repartez avec un aperçu de votre site,
          généré pour votre marque. Gratuit, en moins d'une minute.
        </p>
        <a
          href="https://quiz.digitalzdev.com"
          className="inline-block px-8 py-4 bg-text-primary text-surface font-display font-semibold tracking-wider rounded-lg hover:opacity-90 transition-all"
        >
          GÉNÉRER MA DÉMO GRATUITE
        </a>
      </motion.div>
    </section>
  )
}
