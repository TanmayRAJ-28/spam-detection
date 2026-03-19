import ModelComparison from "@/components/model-comparison";
import SpamTester from "@/components/spam-tester";

export const metadata = {
  title: "Spam Detection — ML Comparison",
  description:
    "Compare Naive Bayes, Logistic Regression, and SVM models for SMS spam detection",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-800">
      <header className="border-b border-stone-200 bg-white sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-stone-800 rounded-md flex items-center justify-center">
              <span className="text-white text-sm font-bold">S</span>
            </div>
            <div>
              <h1 className="text-lg font-medium tracking-tight text-stone-900">
                Spam Detection
              </h1>
              <p className="text-stone-500 text-xs">
                NB / LR / SVM comparison
              </p>
            </div>
          </div>
          <span className="text-xs text-stone-400 hidden sm:block">Applied ML Lab</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 pt-10 pb-20 space-y-12">
        <section>
          <h2 className="text-sm font-medium text-stone-500 uppercase tracking-wider mb-4">
            Classify a message
          </h2>
          <SpamTester />
        </section>

        <hr className="border-stone-200" />

        <section>
          <h2 className="text-sm font-medium text-stone-500 uppercase tracking-wider mb-4">
            Model performance
          </h2>
          <ModelComparison />
        </section>
      </div>

      <footer className="border-t border-stone-200 py-6">
        <p className="text-center text-xs text-stone-400">
          Built with scikit-learn &middot; TF-IDF vectorization &middot; 5,574 SMS messages
        </p>
      </footer>
    </main>
  );
}