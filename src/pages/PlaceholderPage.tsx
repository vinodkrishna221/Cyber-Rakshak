import { Link } from 'react-router-dom';

type PlaceholderPageProps = {
  title: string;
  route: string;
};

export function PlaceholderPage({ title, route }: PlaceholderPageProps) {
  return (
    <section aria-labelledby="page-title" className="rounded-xl border border-blue-100 bg-white p-8 shadow-sm sm:p-12">
      <p className="mb-3 text-sm font-semibold tracking-wide text-chakra uppercase">Cyber Rakshak demo</p>
      <h1 id="page-title" className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-4 max-w-2xl leading-7 text-slate-600">
        The <code className="rounded bg-blue-50 px-1.5 py-0.5 text-navy">{route}</code> route is ready for its guided browser-only demo experience.
      </p>
      <Link className="mt-8 inline-flex rounded-md bg-chakra px-4 py-2 font-medium text-white hover:bg-navy" to="/">
        Return home
      </Link>
    </section>
  );
}
