import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ChoirPage } from "../ChoirPage";
import { SiteContext } from "../content/context";
import { siteContentSchema } from "../content/schema";
import type { SiteContent } from "../content/site";
import { stockholmInput, stockholmToIso } from "./dates";
import "./admin.css";

type RecordData = { content: SiteContent; revision: number; updatedAt: string | null };
type Version = { revision: number; updatedAt: string | null; updatedBy: string };
type Issue = { path: PropertyKey[]; message: string };
async function api<T>(path: string, options?: RequestInit) {
  const response = await fetch(path, { ...options, credentials: "same-origin", cache: "no-store" });
  const data: any = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Det gick inte att nå tjänsten. Logga in igen eller försök senare.");
  return data as T;
}
function download(data: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  const a = document.createElement("a"); a.href = url; a.download = `dalslandskoren-${new Date().toISOString().slice(0, 10)}.json`; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const labels: { [key: string]: string } = { brand: "Varumärke", navigation: "Meny", hero: "Sidhuvud", about: "Om oss", concerts: "Konserter", openRehearsal: "Öppet rep", audition: "Uppsjungning", contact: "Kontakt" };
const dateLabel = (iso: string | null) => iso ? new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm", dateStyle: "medium", timeStyle: "short" }).format(new Date(iso)) : "Startinnehåll";

export function Admin() {
  const [record, setRecord] = useState<RecordData | null>(null);
  const [draft, setDraft] = useState<SiteContent | null>(null);
  const [session, setSession] = useState<{email: string; local: boolean} | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [preview, setPreview] = useState(false);
  const dirty = !!draft && JSON.stringify(draft) !== JSON.stringify(record?.content);

  const refreshHistory = () => api<{versions: Version[]}>("/api/admin/history").then(data => setVersions(data.versions)).catch(() => setNotice("Publicerat, men versionshistoriken kunde inte hämtas. Ladda om sidan för att försöka igen."));
  async function load() {
    setBusy(true); setError(""); setNotice("");
    try {
      const s = await api<{email: string; local: boolean}>("/api/admin/session"); setSession(s);
      const data = await api<RecordData>("/api/public/content");
      const parsed = siteContentSchema.parse(data.content);
      setRecord({ ...data, content: parsed }); setDraft(structuredClone(parsed)); setIssues([]);
      const history = await api<{versions: Version[]}>("/api/admin/history"); setVersions(history.versions);
    } catch (e) { setError(e instanceof Error ? e.message : "Redaktören kunde inte laddas."); }
    finally { setBusy(false); }
  }
  useEffect(() => { void load(); }, []);
  useEffect(() => {
    const leave = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("beforeunload", leave);
    return () => window.removeEventListener("beforeunload", leave);
  }, [dirty]);
  useEffect(() => {
    if (!preview) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setPreview(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [preview]);

  function set(path: string, value: unknown) {
    setDraft(current => {
      if (!current) return current;
      const next = structuredClone(current);
      const keys = path.split(".");
      let target: any = next;
      for (const key of keys.slice(0, -1)) target = target[key];
      target[keys[keys.length - 1]] = value;
      return next;
    });
    setNotice(""); setIssues([]);
  }
  function value(path: string): unknown { return path.split(".").reduce((data: any, key) => data?.[key], draft); }
  function field(path: string, label: string, options: { area?: boolean; optional?: boolean; hint?: string; type?: string } = {}) {
    const props = { id: path, name: path, value: String(value(path) ?? ""), onChange: (e: {target: {value: string}}) => set(path, options.optional && !e.target.value.trim() ? null : e.target.value), "aria-describedby": options.hint ? `${path}-hint` : undefined, "aria-invalid": issues.some(i => i.path.map(String).join(".") === path) || undefined };
    return <div className="editor-field" key={path}><label htmlFor={path}>{label}{options.optional && <small> · valfritt</small>}</label>
      {options.area ? <textarea {...props} rows={4} /> : <input {...props} type={options.type ?? "text"} />}
      {options.hint && <small id={`${path}-hint`}>{options.hint}</small>}
    </div>;
  }
  function group(name: string, intro: string, children: ReactNode, open = false) {
    return <details className="editor-group" open={open}><summary>{name}</summary><div className="editor-group-body"><p className="editor-help">{intro}</p>{children}</div></details>;
  }
  function validate() {
    const result = siteContentSchema.safeParse(draft);
    if (!result.success) { setIssues(result.error.issues); setError("Kontrollera de markerade uppgifterna före publicering eller förhandsvisning."); return null; }
    setIssues([]); setError(""); return result.data;
  }
  async function publish(event: FormEvent) {
    event.preventDefault();
    const content = validate();
    if (!content || !record) return;
    setBusy(true); setNotice("");
    try {
      const data = await api<RecordData>("/api/public/content", { method: "PUT", headers: { "Content-Type": "application/json", "If-Match": String(record.revision) }, body: JSON.stringify(content) });
      setRecord(data); setDraft(structuredClone(data.content)); setNotice("Publicerat! Ändringarna syns nu på webbplatsen."); await refreshHistory();
    } catch (e) { setError(e instanceof Error ? e.message : "Publiceringen misslyckades. Ditt utkast finns kvar."); }
    finally { setBusy(false); }
  }
  async function restore(revision: number) {
    if (dirty && !window.confirm("Ersätt dina osparade ändringar med den här versionen? Ladda ned en kopia först om du vill behålla dem.")) return;
    setBusy(true); setError("");
    try { const data = await api<{content: SiteContent}>(`/api/admin/history/${revision}`); setDraft(siteContentSchema.parse(data.content)); setIssues([]); setNotice("Versionen har lästs in som utkast. Förhandsvisa och välj Publicera när du är klar."); }
    catch (e) { setError(e instanceof Error ? e.message : "Versionen kunde inte hämtas."); }
    finally { setBusy(false); }
  }
  if (preview && draft) return <div className="editor-preview">
    <div className="editor-preview-bar"><strong>Förhandsvisning · ej publicerad</strong><button autoFocus onClick={() => setPreview(false)}>Tillbaka till redigering</button></div>
    <SiteContext.Provider value={draft}><ChoirPage /></SiteContext.Provider>
  </div>;

  return <div className="editor">
    <header className="editor-header"><a href="/" aria-label="Dalslandskören redaktör"><img src="/assets/brand/dbk-circle-transparent.png" width="48" height="48" alt="" /><span>Dalslandskören<small>Redaktör</small></span></a>
      <div>{session && <span className="editor-identity">{session.local ? "Lokal testmiljö" : session.email}</span>}{!session?.local && <a href="/cdn-cgi/access/logout">Logga ut</a>}</div>
    </header>
    <main className="editor-main">
      <div className="editor-intro"><p className="editor-eyebrow">TEXT, KONSERTER & KONTAKT</p><h1>Gör plats för nästa klang.</h1><p>Ändra innehållet, förhandsvisa och publicera när du är nöjd.</p></div>
      {error && <div className="editor-message editor-error" role="alert">{error}{issues.length > 0 && <ul>{issues.map((i, n) => <li key={n}>{labels[String(i.path[0])] ?? String(i.path[0])} · {i.path.slice(1).map(String).join(" / ")}: {i.message}</li>)}</ul>}</div>}
      {notice && <p className="editor-message" role="status">{notice}</p>}
      {!draft || !record ? <div className="editor-group-body"><p>{busy ? "Hämtar innehåll…" : "Innehållet kunde inte hämtas."}</p><button disabled={busy} onClick={() => void load()}>Försök igen</button></div> : <>
        <form onSubmit={publish} noValidate>
          <div className="editor-toolbar"><div><strong>{dirty ? "Opublicerade ändringar" : "Allt är publicerat"}</strong><small>Version {record.revision} · {dateLabel(record.updatedAt)}</small></div><div className="editor-actions"><button type="button" disabled={busy} onClick={() => { if (validate()) setPreview(true); }}>Förhandsvisa</button><button className="editor-primary" disabled={busy || !dirty} type="submit">{busy ? "Arbetar…" : "Publicera"}</button></div></div>
          <fieldset disabled={busy}>
            {group("Sidhuvud", "Det första besökarna ser på sidan.", <>
              {field("hero.title", "Huvudrubrik")}{field("hero.secondaryTitle", "Andra raden")}{field("hero.subtitle", "Underrubrik")}
              {field("hero.image", "Bildadress", { hint: "Behåll den befintliga sökvägen eller ange en https-länk till en bild. Nya lokala bildfiler läggs till i GitHub av webbansvarig." })}
              {field("hero.imageAlt", "Beskrivning av bilden", { hint: "En kort beskrivning för besökare som använder skärmläsare." })}
              <label className="editor-checkbox"><input type="checkbox" checked={draft.hero.imageIsConcept} onChange={e => set("hero.imageIsConcept", e.target.checked)} />Bilden är en illustration eller konceptbild</label>
            </>, true)}
            {group("Om oss", "Berätta om kören med era egna ord.", <>{field("about.title", "Rubrik")}{field("about.text", "Presentation", { area: true })}</>)}
            {group("Öppet rep", "Bjud in till en repetition. Länka till kontakt tills det finns ett riktigt evenemang.", <>
              {field("openRehearsal.title", "Rubrik")}{field("openRehearsal.text", "Text", { area: true })}{field("openRehearsal.cta.label", "Knapptext")}{field("openRehearsal.cta.href", "Knapplänk", { hint: "Till exempel #kontakt eller en https-adress till ett evenemang." })}
            </>)}
            {group("Uppsjungning", "Information för den som vill börja sjunga med er.", <>
              {field("audition.title", "Rubrik")}{field("audition.text", "Text", { area: true })}{field("audition.cta.label", "Knapptext")}{field("audition.cta.href", "Knapplänk")}{field("audition.bookingUrl", "Bokningslänk", { optional: true, hint: "Lämna tomt för att använda knapplänken ovan." })}
            </>)}
            {group("Konserter", "Lägg till riktiga datum och platser. Utan konserter visas texten för en tom lista.", <>
              {field("concerts.title", "Rubrik")}{field("concerts.emptyState", "Text när inga konserter finns", { area: true })}{field("concerts.eventLabel", "Knapptext för evenemang")}
              {draft.concerts.items.map((c, index) => <div className="editor-concert" key={index}><h3>Konsert {index + 1}</h3>
                {field(`concerts.items.${index}.title`, "Konsertens namn")}
                <label className="editor-field"><span>Datum och tid · svensk tid</span><input type="datetime-local" value={stockholmInput(c.date)} onChange={e => set(`concerts.items.${index}.date`, stockholmToIso(e.target.value) ?? e.target.value)} /><small>Europe/Stockholm. Vid höstens dubbla klockslag väljs den första förekomsten.</small></label>
                {field(`concerts.items.${index}.venue`, "Plats")}{field(`concerts.items.${index}.description`, "Beskrivning", { area: true })}
                {field(`concerts.items.${index}.ticketUrl`, "Biljettlänk", { optional: true })}{field(`concerts.items.${index}.eventUrl`, "Evenemangslänk", { optional: true })}
                <div className="editor-actions"><button type="button" disabled={index === 0} onClick={() => { const items = [...draft.concerts.items]; [items[index - 1], items[index]] = [items[index], items[index - 1]]; set("concerts.items", items); }}>Flytta upp</button><button type="button" onClick={() => { if (window.confirm("Ta bort den här konserten från utkastet?")) set("concerts.items", draft.concerts.items.filter((_, i) => i !== index)); }}>Ta bort konsert</button></div>
              </div>)}
              <button type="button" disabled={draft.concerts.items.length >= 100} onClick={() => set("concerts.items", [...draft.concerts.items, { title: "", date: "", venue: "", description: "", ticketUrl: null, eventUrl: null }])}>+ Lägg till konsert</button>
            </>)}
            {group("Kontakt", "Här lägger ni in de kontaktuppgifter som får visas offentligt. Konto-adressen publiceras inte automatiskt.", <>
              {field("contact.title", "Rubrik")}{field("contact.intro", "Inledning", { area: true })}{field("contact.email", "Offentlig e-postadress", { optional: true, type: "email" })}{field("contact.instagramUrl", "Instagramprofil", { optional: true })}{field("contact.emptyState", "Text när kontaktuppgifter saknas")}
            </>)}
            {group("Namn och meny", "Behåll helst namnet och bildsökvägen. Menylänkar kan peka på #hem, #om-oss, #konserter och #kontakt.", <>
              {field("brand.name", "Körens namn")}{field("brand.logo", "Logotypens bildadress")}
              {draft.navigation.map((_, i) => <div className="editor-concert" key={i}>{field(`navigation.${i}.label`, "Menytext")}{field(`navigation.${i}.href`, "Menylänk")}<button type="button" onClick={() => set("navigation", draft.navigation.filter((_, index) => index !== i))}>Ta bort menylänk</button></div>)}
              <button type="button" disabled={draft.navigation.length >= 6} onClick={() => set("navigation", [...draft.navigation, { label: "", href: "#kontakt" }])}>+ Lägg till menylänk</button>
            </>)}
          </fieldset>
        </form>
        <section className="editor-secondary"><h2>Versioner och säkerhetskopior</h2><p>De 50 senaste publiceringarna sparas. En tidigare version läses in som utkast innan du publicerar den igen.</p>
          <div className="editor-actions"><button disabled={busy} onClick={() => download({ content: draft, revision: record.revision, exportedAt: new Date().toISOString() })}>Ladda ned utkast</button><button disabled={busy} onClick={() => { if (!dirty || window.confirm("Läs in den publicerade versionen och kasta osparade ändringar?")) void load(); }}>Läs in senaste publicering</button></div>
          <label className="editor-field"><span>Importera en nedladdad kopia som utkast</span><input type="file" accept="application/json,.json" disabled={busy} onChange={async e => {
            const file = e.target.files?.[0]; if (!file) return;
            if (dirty && !window.confirm("Ersätt dina osparade ändringar med filens innehåll?")) { e.target.value = ""; return; }
            try { if (file.size > 250000) throw new Error("Filen är för stor."); const data = JSON.parse(await file.text()); setDraft(siteContentSchema.parse(data.content ?? data)); setIssues([]); setError(""); setNotice("Kopian har lästs in som utkast. Förhandsvisa före publicering."); }
            catch { setError("Filen kunde inte läsas. Välj en giltig innehållskopia från redaktören."); } e.target.value = "";
          }} /></label>
          <div className="editor-versions">{versions.map(v => <div key={v.revision}><span><strong>Version {v.revision}</strong><small>{dateLabel(v.updatedAt)} · {v.updatedBy}</small></span><button disabled={busy} onClick={() => void restore(v.revision)}>Läs in som utkast</button></div>)}</div>
        </section>
      </>}
    </main>
    <footer className="editor-footer">Dalslandskören Blåklang · {session?.local ? "Ändringar sparas bara i den lokala testdatabasen." : "Ändringar blir synliga först när du publicerar."}</footer>
  </div>;
}
