'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronRight, ExternalLink, Landmark, Search } from 'lucide-react';

type Service = { name: string; category: string; detail?: string };

const catalog: { category: string; services: string[] }[] = [
  { category: 'Umuryango', services: ['Services z'ubutane', 'Kwemeza ko umuntu ari imfuby_i', 'Icyemezo cy'Ubutishoboye Warokotse Jenoside yakorewe Abatutsi mu 1994', 'Inyandiko y'ubwishyingire', 'Amasezerano y'ubutane cyangwa gusaba ko ishyingiranwa rivanywe', 'Ibaruwa ifasha abantu bafite ubumuga', 'Gusaba numero iranga utishoboye warokotse Jenoside yakorewe Abatutsi mu 1994', 'Icyemezo cy'izuyungurura', 'Icyemezo cy'imibari y'abashyingiranywe', 'Icyemezo cy'ubupfakazi', 'Icyemezo cy'uko utuye', 'Icyemezo cy'uko uri ingaragu', 'Serivisi z'amavuko', 'Serivisi z'ishyingirwa', 'Serivisi zihabwa uwarambye Imana', 'Inyandiko yo kubera umubyeyi umwana watabye', 'Inyandiko yo kwemeera umwana'] },
  { category: 'Abinjira N’abasohoka', services: ['Gusubirana ubwene gihugu nyarwanda', 'Ubwenegihugu nyarwanda butangwa', 'Uburenganzira bwo kugera mu nkambi y’impunzi', 'Gusaba urwandiko rw’inzira rw’impunzi', 'Kujyanwa mu nkambi z’impunzi zicyangwe'], },
  { category: 'Irangamimerere', services: ['Gusaba Indangamuntu', 'Gusimbuza Indangamuntu Yatakaye', 'Kwemeza imyirondoro y’indangamuntu koranabuhanga y’abashyingiwe', 'Icyemezo cy’uwirondore wuzuye', 'Icyemezo cyo guhindura izina', 'Gusaba gukosorerwa Indangamuntu', 'Icyemezo cy’ubwenegihugu', 'Icyemezo cy’ukwo umuntu ariho', 'Kwemeza imyirondoro y’indangamuntu koranabuhanga y’umuntu ku giti cye'] },
  { category: 'Ubutaka', services: ['Kuvugurura imbibi no gukosora utaka', 'Kwandikisha ubutaka butaburagur', 'Kwandikisha no gucamo ibice iniyubako', 'Gushyira umuko kwo na Noteri ku masezerano y’inguzanyo', 'Amashezerano y’uburenganzira ku butaka', 'Guhuza ubutaka', 'Kubagana ubutaka', 'Amahanzira agenga imikoreshereze y’ubutaka', 'Gukosora amakuru mu gitabo cy’inyandiko z’ubutaka'] },
  { category: 'Polisi', services: ['Gusaba kopi y’urupapuro rwo gutwara ibinyabiziga', 'Guhabwa uruhushya watsindye', 'Kwiyandikisha gukora ikizamini cyo gutwara ibinyabiziga', 'Kongera igihe cy’urupushya rwo gutwara ibinyabiziga', 'Kwishyura konterevaseviyo', 'Amanota y’ikizamini cyo gutwara ibinyabiziga', 'Gusimbuza/Guhindura uruhushya rwa Burundi', 'Gukosora uruhushya rwo gutwara ibinyabiziga'] },
  { category: 'Isuzuma ry’ibinyabiziga', services: ['Kopi y’icyemezo cy’isuzuma ry’ikinyabiziga', 'Gahunda ya mbere y’isuzuma rikora ku mungero z’imyanya', 'Kubitaburiza amapfaranga y’isuzuma ry’ibinyabiziga', 'Gahunda yo gusuzumisha imyuka', 'Guhabwa gahunda yo gusuzuma imodoka', 'Gahunda yo gusuzuma imyuka ku nshuro ya kabiri', 'Gahunda yo gukora isuzuma rya tekinike ku nshuro ya kabiri'] },
  { category: 'Serivisi za Noteri na Serivisi Yigazeti', services: ['Serivisi zitandukanye za Noteri', 'Gutangaza mu Igazeti ya Leta', 'Kugura Igazeti ya Leta'] },
  { category: 'Ubuzima', services: ['Ibizamin by laboratwa', 'Urukingo rwa Yellow Fever', 'Kwishyura Mutuweli', 'Itangwa ry’uburenganzira bwo gutanga izaruro'] },
  { category: 'Uburezi', services: ['Gutanga Ibaruwa isaba imyano cyangwa ikure leta na MINEDUC', 'Urugo mbonerakuri', 'Gusaba icyemezo gihwa agaciro impamyabumenyi zatanzwe mu mahanga - Kaminuza', 'Gusaba kunga inyandiko z’amahanga', 'Gusaba amaserwano y’imikorere ku mirangano y’uburezi', 'Icyemezo gihabwa agaciro imyamyabumenyi zo mu mahanga', 'Icyemezo cyo gutanga ibikoreshe by’ikorwa', 'Icyemezo cy’uko uwize ariho', 'Icyemezo gihabwa agaciro impamyabumenyi za TVET'] },
  { category: 'Ibye... By’ubushinjacyaha N’ubugenzacyaha', services: ['Icyemezo cy’imyemekanish rya/lib...','Icyemezo cyo kohereza umurambo w’uwapfuye mu mahanga','Icyangombwa cyerekana ko umuntu yagiye cyangwe atakaje n’inkiko', 'Icyemezo cy’ipereereza ry’ibyaha', 'Igenzura ry’inyandiko ryakorewe na INTERPOL-KIGALI'] },
  { category: 'Intangazamakuru N’imibereho Myiza Y’abaturage', services: ['Gusaba no Kwishyura Ibarendera ry’igihugu', 'Gusaba amafaranga yo gufasha mu mishahara', 'Gusaba uruhushya rwo gukorera mu gihugu cy’amahanga'] },
  { category: 'Gusura Ingoro Ndangamurage, Ibyicumbi By’Intwari, N’Inzibutso', services: ['Ibikorwa by’inyuzi ndangamurage', 'Gusura Inzibutso za Jenoside yakorewe Abatutsi', 'Gusura Ijicumbi cy’Intwari z’igihugu', 'Gufata Gahunda yo Gusura'] },
  { category: 'Ibikorwa Remezo N’ibidukikije', services: ['Uruhushya rwo gushinga Icyapa cyibobora abantu', 'Uruhushya rwo gutwara ibikomoka ku mashyamba', 'Ibikorwa byo gutera amashyamba: imbuto z’ibiti, ingemwe, ibiti byakira ibindi, ingeri', 'Uruhushya rwo kohereza mu mahanga ibikomoka ku mashyamba', 'Uruhushya rwo gusarura amashyamba'] },
  { category: 'Utabotere', services: ['Gusaba Inyandiko y’urubanza rwaciwe', 'Gutanga amabwiriza ku rukiko', 'Uruhushya rwo gutanga serivisi z’ubuvuzi'] },
  { category: 'Serivisi Z’iposita', services: ['Kwandikisha aderesi ya ePoBox', 'Kuvugurura aderesi ya ePoBox', 'Hindura izina ry’iposita rya ePoBox'] },
  { category: 'Serivisi Z’ibikorwa remezo', services: ['Gusaba Guhabwa Amazi', 'Gusaba Gusubizwa Amazi', 'Gusaba Konteri y’Inyongera'] },
  { category: 'Serivisi Z’Indangambuga', services: ['Kwandikisha indangambuga ya RW'] },
  { category: 'Serivisi Zitanga Uruhushya Rwo Kubaka', services: ['Uruhushya rwo kuvugurura inyubako', 'Icyemezo cyo guhindura imikoreshereze y’inyubako', 'Uruhushya rwo gusenya', 'Gusaba Gusuzuma Inyubako', 'Kubaka Urusitiro', 'Uruhushya rwo Kubaka inyubako z’igihe gito', 'Kongera igihe Uruhushya Rumara', 'Gusaba Gusuzuma Inyubako nshya', 'Imipinduka ku Mushinga w’Ubwubatsi'] },
  { category: 'Imiyoborere', services: ['Ibaruwa y’Ubufatanye itangwa n’Akere cyane Umujyi wa Kigali ku miryango y’imiryango', 'Gushinga Ishami (Insengero/Imisigiti)', 'MBAZA'] },
  { category: 'Ibikorwa By’ubuhinzi', services: ['Uruhushya rwo kohereza ibicuruzwa byo mu mahanga', 'Uruhushya rwo kohereza icyayi mu mahanga', 'Uruhushya rwo kohereza ikawa mu mahanga', 'Icyemezo cyo kohereza icyayi hanze', 'Icyemezo cyo kohereza ikawa hanze'] },
  { category: 'Ubucuruzi N’inganda', services: ['Gusaba umwanya wo gukurikirana ibicuruzwa', 'Icyangombwa cy’inganda', 'Uruhushya rwo gukora ubucuruzi', 'Gusaba ikinyabiziga gitwara inyama', 'Uburenganzira bw’uvuguruzanya', 'Gukandika ikinyabiziga yo gukoreramo', 'Gusaba Impinduka ku Biciro by’Amera...'] },
  { category: 'Siporo', services: ['Uruhushya rwo gukora siporo ku banyeshuri b’abakinnyi', 'Ibaruwa isaba guhabwa indangamuntu mu NIDA', 'Uruhushya rwo gukora urugendo', 'Ibaruwa isaba guhabwa pasiporo ya serivisi', 'Inkunga ya tekiniki kw’iterambere ry’ibikorwa remezo'] },
  { category: 'Ubushakashatsi N’ibarurishamibare', services: ['Uruhushya rwa Visa y’ubushakashatsi', 'Kwemeza kongera igihe viza y’ubushakashatsi', 'Raporo yo gutangaza ubushakashatsi'] },
  { category: 'Serivisi Za Minisitiri Y’ububanyi N’amahanga', services: ['Gusaba kwemeza ibyagombwa biva mu mahanga', 'Gusaba Icyemezo gihabwa agaciro impamyabumenyi biba mu mahanga', 'Gusaba ibaruwa y’afashishwa mu gusaba Visa y’igihugu', 'Gusaba guserorewa imisoro ku mutungo', 'Gusaba ibarurwa y’afashishwa dipolomatike', 'Gusaba ibaruwa y’afashishwa impapuro', 'Gusaba ibaruwa y’inshingano ku muryango'] },
  { category: 'Ubuhinzi N’ubworozi', services: ['Kugura urukingo', 'Kugura intanga z’inka', 'Kugura amatungo', 'Ibaruwa Isaba Gushonerwa TVA', 'Gutanga ibaruwa isaba ku miryango itandukanye'] },
  { category: 'Intambi N’ibishashi', services: ['Uruhushya rwo guturitsa urufaya rw’ibishashi', 'Uruhushya rwo gutumiza ibishashi hanze y’igihugu', 'Uruhushya rwo kwinjiza intambi mu gihugu'] },
  { category: 'Kwandikisha Inama N’ibirori', services: ['Kwandikisha kwitabira inama ya NCST'] },
];

function slugify(value: string) {
  return encodeURIComponent(value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-'));
}

export default function ServicesPage() {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<string>('All');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog
      .map((group) => ({ ...group, services: group.services.filter((s) => !q || s.toLowerCase().includes(q) || group.category.toLowerCase().includes(q)) }))
      .filter((group) => (active === 'All' || group.category === active) && group.services.length > 0);
  }, [query, active]);

  const total = catalog.reduce((sum, group) => sum + group.services.length, 0);

  return (
    <main className="min-h-screen bg-white text-slate-800">
      <section className="bg-[linear-gradient(135deg,#0488df,#0d78cf_55%,#1672c9)] px-5 pb-10 pt-6 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white"><ArrowLeft size={16}/> Dashboard</Link>
            <Link href="/chat" className="rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/20">Ask LUMIA</Link>
          </div>
          <div className="mx-auto max-w-xl pt-8 text-center">
            <div className="text-3xl font-semibold tracking-tight">Murakaza neza</div>
            <div className="relative mt-5">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={16}/>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Gushakisha serivisi" className="w-full rounded-md border-0 bg-white px-11 py-3 text-sm text-slate-800 shadow-lg outline-none placeholder:text-slate-400"/>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-9">
        <div className="rounded-xl border border-sky-100 bg-sky-50 px-5 py-5">
          <div className="flex gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-sky-600 shadow"><Landmark size={20}/></div>
            <div><h2 className="font-semibold text-slate-800">Serivisi ziboneka ku rubuga IremboGov rwavuguruwe</h2><p className="mt-1 text-sm leading-6 text-slate-600">Sura urubuga IremboGov rwavuguruwe kugirango uhishwe amakuru mashya kandi ubone serivisi z'leta.</p></div>
            <a href="https://irembo.gov.rw" target="_blank" rel="noreferrer" className="ml-auto hidden shrink-0 self-center items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white sm:inline-flex">Fungura <ExternalLink size={14}/></a>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between gap-4">
          <div><div className="text-sm font-semibold text-slate-700">Ibyiciro byose</div><div className="text-xs text-slate-400">{total} services</div></div>
          <div className="relative">
            <select value={active} onChange={(e) => setActive(e.target.value)} className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-9 text-xs text-slate-600 outline-none">
              <option>All</option>
              {catalog.map((g) => <option key={g.category}>{g.category}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 text-slate-400" size={14}/>
          </div>
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          {filtered.map((group) => (
            <section key={group.category} className="py-7 first:pt-2">
              <h2 className="text-base font-semibold text-slate-700">{group.category}</h2>
              <div className="mt-4 grid gap-x-8 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, col) => {
                  const items = group.services.filter((_, i) => i % 3 === col);
                  return <div key={col} className="border-l border-slate-100 pl-4">
                    <div className="space-y-4">
                      {items.map((service) => <Link key={service} href={`/services/${slugify(service)}`} className="group block text-xs leading-5 text-slate-600 hover:text-sky-700">{service}<ChevronRight size={12} className="ml-1 inline text-sky-400 opacity-60 group-hover:opacity-100"/></Link>)}
                    </div>
                  </div>;
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
