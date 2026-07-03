import { GoogleGenAI, Modality } from "@google/genai";
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const script = `
"Main neeyat karta hoon do rakat namaz Sunnah, Fajr ki, Allah ke liye, rukh mera Kaaba Sharif ki taraf."

Allahu Akbar.

Subhanaka Allahumma wa bihamdika, wa tabarakasmuka, wa ta'ala jadduka, wa la ilaha ghayruk.Bismillahir-Rahmanir-Rahim. Al-hamdu lillahi Rabbil-alamin. Ar-Rahmanir-Rahim. Maliki yawmid-din. Iyyaka na’budu wa iyyaka nasta’in. Ihdinas-siratal-mustaqim. Siratal-ladhina an’amta alayhim, ghayril-maghdubi alayhim walad-dallin. Amin.

Bismillahir-Rahmanir-Rahim. Qul huwal-lahu ahad. Allahus-samad. Lam yalid wa lam yulad. Wa lam yakul-lahu kufuwan ahad.

Allahu Akbar.

Subhana Rabbiyal Azeem. Subhana Rabbiyal Azeem. Subhana Rabbiyal Azeem.

Sami’ Allahu liman hamidah. Rabbana lakal hamd.

Allahu Akbar.

Subhana Rabbiyal A'la. Subhana Rabbiyal A'la. Subhana Rabbiyal A'la.

Allahu Akbar.

Allahu Akbar.

Subhana Rabbiyal A'la. Subhana Rabbiyal A'la. Subhana Rabbiyal A'la.

Allahu Akbar.

Bismillahir-Rahmanir-Rahim. Al-hamdu lillahi Rabbil-alamin. Ar-Rahmanir-Rahim. Maliki yawmid-din. Iyyaka na’budu wa iyyaka nasta’in. Ihdinas-siratal-mustaqim. Siratal-ladhina an’amta alayhim, ghayril-maghdubi alayhim walad-dallin. Amin.

Bismillahir-Rahmanir-Rahim. Inna a’tainakal-kawthar. Fa salli li rabbika wanhar. Inna shani’aka huwal-abtar.

Allahu Akbar.

Subhana Rabbiyal Azeem. Subhana Rabbiyal Azeem. Subhana Rabbiyal Azeem.

Sami’ Allahu liman hamidah. Rabbana lakal hamd.

Allahu Akbar.

Subhana Rabbiyal A'la. Subhana Rabbiyal A'la. Subhana Rabbiyal A'la.

Allahu Akbar.

Allahu Akbar.

Subhana Rabbiyal A'la. Subhana Rabbiyal A'la. Subhana Rabbiyal A'la.

Allahu Akbar.

Attahiyyatul-lillahi was-salawatu wat-tayyibat. As-salamu alayka ayyuhan-nabiyyu wa rahmatullahi wa barakatuh. As-salamu alayna wa ala ibadil-lahis-salihin. Ash-hadu alla ilaha illallah, wa ash-hadu anna Muhammadan abduhu wa rasuluh.

Allahumma salli ala Muhammadin wa ala ali Muhammadin, kama sallayta ala Ibrahima wa ala ali Ibrahima, innaka Hamidun Majid. Allahumma barik ala Muhammadin wa ala ali Muhammadin, kama barakta ala Ibrahima wa ala ali Ibrahima, innaka Hamidun Majid.

Allahumma inni zalamtu nafsi zulman kathiran wa la yaghfirudh-dhunuba illa Anta, faghfir li maghfiratan min indika war-hamni, innaka Antal-Ghafurur-Rahim.

Assalamu alaikum wa Rahmatullah.

Assalamu alaikum wa Rahmatullah.

"Main neeyat karta hoon do rakat namaz Farz, Fajr ki, Allah ke liye, rukh mera Kaaba Sharif ki taraf."

Allahu Akbar.

Subhanaka Allahumma wa bihamdika, wa tabarakasmuka, wa ta'ala jadduka, wa la ilaha ghayruk.Bismillahir-Rahmanir-Rahim. Al-hamdu lillahi Rabbil-alamin. Ar-Rahmanir-Rahim. Maliki yawmid-din. Iyyaka na’budu wa iyyaka nasta’in. Ihdinas-siratal-mustaqim. Siratal-ladhina an’amta alayhim, ghayril-maghdubi alayhim walad-dallin. Amin.

Bismillahir-Rahmanir-Rahim. Qul ya ayyuhal-kafirun. La a'budu ma ta'budun. Wa la antum abiduna ma a'bud. Wa la ana abidum ma abadtum. Wa la antum abiduna ma a'bud. Lakum dinukum wa liya din.

Allahu Akbar.

Subhana Rabbiyal Azeem. Subhana Rabbiyal Azeem. Subhana Rabbiyal Azeem.

Sami’ Allahu liman hamidah. Rabbana lakal hamd.

Allahu Akbar.

Subhana Rabbiyal A'la. Subhana Rabbiyal A'la. Subhana Rabbiyal A'la.

Allahu Akbar.

Allahu Akbar.

Subhana Rabbiyal A'la. Subhana Rabbiyal A'la. Subhana Rabbiyal A'la.

Allahu Akbar.

Bismillahir-Rahmanir-Rahim. Al-hamdu lillahi Rabbil-alamin. Ar-Rahmanir-Rahim. Maliki yawmid-din. Iyyaka na’budu wa iyyaka nasta’in. Ihdinas-siratal-mustaqim. Siratal-ladhina an’amta alayhim, ghayril-maghdubi alayhim walad-dallin. Amin.

Bismillahir-Rahmanir-Rahim. Qul huwal-lahu ahad. Allahus-samad. Lam yalid wa lam yulad. Wa lam yakul-lahu kufuwan ahad.

Allahu Akbar.

Subhana Rabbiyal Azeem. Subhana Rabbiyal Azeem. Subhana Rabbiyal Azeem.

Sami’ Allahu liman hamidah. Rabbana lakal hamd.

Allahu Akbar.

Subhana Rabbiyal A'la. Subhana Rabbiyal A'la. Subhana Rabbiyal A'la.

Allahu Akbar.

Allahu Akbar.

Subhana Rabbiyal A'la. Subhana Rabbiyal A'la. Subhana Rabbiyal A'la.

Allahu Akbar.

Attahiyyatul-lillahi was-salawatu wat-tayyibat. As-salamu alayka ayyuhan-nabiyyu wa rahmatullahi wa barakatuh. As-salamu alayna wa ala ibadil-lahis-salihin. Ash-hadu alla ilaha illallah, wa ash-hadu anna Muhammadan abduhu wa rasuluh.

Allahumma salli ala Muhammadin wa ala ali Muhammadin, kama sallayta ala Ibrahima wa ala ali Ibrahima, innaka Hamidun Majid. Allahumma barik ala Muhammadin wa ala ali Muhammadin, kama barakta ala Ibrahima wa ala ali Ibrahima, innaka Hamidun Majid.

Allahumma inni zalamtu nafsi zulman kathiran wa la yaghfirudh-dhunuba illa Anta, faghfir li maghfiratan min indika war-hamni, innaka Antal-Ghafurur-Rahim.

Assalamu alaikum wa Rahmatullah.

Assalamu alaikum wa Rahmatullah.
`;

async function generate() {
  console.log("Generating audio...");
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: script }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Zephyr' }, // Zephyr is a good male voice
          },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64Audio) {
    fs.writeFileSync('./public/fajr-prayer.mp3', Buffer.from(base64Audio, 'base64'));
    console.log("Audio saved to ./public/fajr-prayer.mp3");
  } else {
    console.error("Failed to generate audio");
  }
}

generate().catch(console.error);
