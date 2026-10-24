
import { createFileRoute } from "@tanstack/react-router";
import { HeartPulse, Search, ShieldCheck, Stethoscope, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4 md:px-12">
        <a href="/" className="flex items-center gap-3">
          <HeartPulse className="h-9 w-9 text-blue-600" />
          <span className="text-xl font-bold">HealthCompare</span>
        </a>
        <a href="#compare" className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">
          Compare costs
        </a>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:px-12">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
            <ShieldCheck size={17} /> Smarter healthcare decisions
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Better healthcare.
            <span className="block text-blue-600">Clearer costs.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Explore healthcare providers, compare estimated treatment costs,
            and make more informed decisions for your health and budget.
          </p>
          <a href="#compare" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white hover:bg-blue-700">
            Explore providers <ArrowRight size={19} />
          </a>
        </div>

        <div className="rounded-3xl border bg-white p-8 shadow-xl shadow-slate-200/60">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-blue-100 p-4 text-blue-700">
              <Stethoscope size={30} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Compare with confidence</h2>
              <p className="mt-1 text-sm text-slate-500">Healthcare information in one place</p>
            </div>
          </div>
          <div className="mt-8 space-y-4">
            {[
              ["Provider comparison", "Explore healthcare options"],
              ["Cost estimates", "Understand potential expenses"],
              ["Informed decisions", "Know what to ask providers"],
            ].map(([title, description]) => (
              <div key={title} className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">
                <ShieldCheck className="shrink-0 text-emerald-600" size={23} />
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-sm text-slate-500">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="compare" className="mx-auto max-w-7xl px-6 pb-20 md:px-12">
        <div className="mb-8">
          <p className="font-semibold text-blue-600">GET STARTED</p>
          <h2 className="mt-2 text-3xl font-bold">What would you like to compare?</h2>
          <p className="mt-3 text-slate-600">Choose a starting point for your healthcare research.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ["Hospital services", "Explore hospital services and estimated expenses."],
            ["Doctor consultations", "Understand consultation options and fees."],
            ["Diagnostic tests", "Compare potential costs of diagnostic services."],
          ].map(([title, description]) => (
            <article key={title} className="rounded-2xl border bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-5 inline-flex rounded-xl bg-blue-50 p-3 text-blue-600">
                <Search size={24} />
              </div>
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="mt-3 leading-6 text-slate-600">{description}</p>
              <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-blue-600">
                Explore options <ArrowRight size={16} />
              </div>
            </article>
          ))}
        </div>
        <p className="mt-6 text-sm text-slate-500">
          Cost information is for research purposes. Confirm actual prices and availability directly with providers.
        </p>
      </section>

      <footer className="border-t bg-white px-6 py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} HealthCompare · Better care. Smarter costs.
      </footer>
    </main>
  );
}
