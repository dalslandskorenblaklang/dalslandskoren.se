# Redigera Dalslandskörens webbplats

När webbplatsen är driftsatt öppnar du **https://admin.dalslandskoren.se**. Du behöver inte kunna koda, använda GitHub eller hantera API-nycklar.

## Logga in

Skriv din godkända e-postadress och ange engångskoden som skickas dit. Om du inte får en kod behöver webbansvarig kontrollera att din adress finns i både Cloudflare Access och webbplatsens redaktörslista.

Tills vidare används `dalslandskorenblaklang@gmail.com` som konto för ägaren. Andra redaktörer kan få tillgång med sina egna adresser. Konto-adressen visas inte automatiskt på den offentliga sidan.

## Ändra och publicera

1. Öppna det avsnitt du vill ändra: Sidhuvud, Om oss, Öppet rep, Uppsjungning, Konserter, Kontakt eller Namn och meny.
2. Ändra texten eller länken. Ändringarna är ett utkast i din öppna webbläsare.
3. Välj **Förhandsvisa**. Välj **Tillbaka till redigering** eller tryck Escape när du har tittat klart.
4. Välj **Publicera**. När bekräftelsen visas är innehållet sparat och syns vid nästa sidladdning på den offentliga webbplatsen.

Ett utkast sparas inte automatiskt. Webbläsaren varnar om du lämnar sidan med opublicerade ändringar. Vill du fortsätta en annan dag, välj **Ladda ned utkast** och behåll filen. Du kan senare importera filen som ett utkast.

## Konserter

Under **Konserter**, välj **Lägg till konsert**. Fyll i namn, datum, tid och plats. Beskrivning och biljett-/evenemangslänkar är valfria. Datum och tid anges alltid i **svensk tid**, även om din dator är inställd på en annan tidszon.

Webbplatsen tar hänsyn till sommar- och vintertid. En tid som inte finns när klockan ställs fram går inte att publicera. Under höstens dubbla timme används den första förekomsten; kontakta webbansvarig om ett evenemang behöver den andra.

**Flytta upp** ändrar ordningen. **Ta bort konsert** tar bort den ur utkastet. Om listan är tom visas texten “Text när inga konserter finns”. Gamla konserter försvinner inte automatiskt: ta bort eller ändra dem och publicera igen.

## Länkar och kontakt

- En webblänk börjar med `https://`.
- `#kontakt` länkar till kontaktavsnittet på sidan. Andra befintliga avsnitt är `#hem`, `#om-oss`, `#oppet-rep`, `#uppsjungning` och `#konserter`.
- En e-postlänk i en knapp kan skrivas som `mailto:offentlig-adress@exempel.se`.
- Fältet **Offentlig e-postadress** ska bara innehålla själva adressen. Lämna det tomt tills ni har en adress som får visas offentligt.
- Lämna Instagram tomt tills ni har länken till den riktiga profilen.

Använd riktiga evenemangslänkar och bekräftade datum. Webbplatsen har inga formulär som skickar meddelanden; e-postlänkar öppnar besökarens e-postprogram.

## Bilder

Den nya blomman bredvid “Om oss” är redan inlagd. Bilder och typsnitt levereras från webbplatsen.

Under Sidhuvud kan du ange en https-länk till en ny huvudbild. Beskriv bilden i text för besökare som använder skärmläsare. Avmarkera “Bilden är en illustration eller konceptbild” först när ni använder en riktig bild av kören.

Bildfiler laddas inte upp genom redaktören i den här versionen. Be webbansvarig lägga en fil under `public/assets/images/` och ange sedan dess sökväg, till exempel `/assets/images/korfoto.webp`. Behåll den befintliga logotypens sökväg om den inte ska bytas.

## Om någon annan publicerar samtidigt

Publiceringen stoppas om en annan redaktör har hunnit spara sedan du öppnade sidan. Ditt utkast finns kvar.

1. Välj **Ladda ned utkast** för att behålla en kopia.
2. Välj **Läs in senaste publicering**.
3. För in dina ändringar i den nya versionen och publicera igen. Att importera hela ditt gamla utkast ersätter hela sidans innehåll, så kontrollera att du också behåller den andra redaktörens ändringar.

## Ångra en publicering

Under **Versioner och säkerhetskopior** finns de senaste 50 publiceringarna.

Välj **Läs in som utkast** vid en tidigare version. Granska och förhandsvisa den. Den offentliga sidan ändras först när du väljer **Publicera**. Den nya publiceringen blir en ny version i historiken.

**Version 0** är startinnehållet som följer med webbplatsens kod. **Läs in senaste publicering** kastar ditt utkast och hämtar det som är publicerat just nu.

## Innan ni lanserar

Kontrollera presentationen av kören, lägg till en offentlig kontaktväg och eventuella riktiga konserter. Huvudbilden från demon är fortfarande en tydligt märkt konceptbild. Byt den till en godkänd bild när ni har en.
