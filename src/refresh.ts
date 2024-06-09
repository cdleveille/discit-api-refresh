import jsdom from "jsdom";

import { deleteAllDiscs, getAllDiscs, insertDiscs, revalidateDiscItCache } from "./api";
import { Config } from "./config";
import { DISC_FETCH_URL, Site } from "./constants";
import {
	discMeetsMinCriteria,
	hashString,
	parseCategory,
	parseDecimalString,
	parseStability,
	slugify
} from "./helpers";

import type { IDisc, IDiscCollections } from "./types";

const { JSDOM } = jsdom;
const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("error", () => {
	// No-op to skip console errors.
});

export const refreshDiscs = async () => {
	try {
		console.log("*** START *** - disc refresh process starting.");
		const existingDiscs = await backupDiscs();
		const discCollections = await getDiscs();
		const discsToInsert = processDiscs(discCollections);
		if (discsToInsert.length >= existingDiscs.length) {
			await doDeleteAllDiscs();
			await doInsertDiscs(discsToInsert);
			await doRevalidateDiscItCache();
		} else {
			console.log("Database is up-to-date. No further action needed.");
		}
		console.log("*** END *** - disc refresh process completed successfully.");
	} catch (error) {
		console.error(error);
		console.error("*** ABEND *** - disc refresh process completed with errors.");
	}
};

const backupDiscs = async () => {
	try {
		console.log("Getting all existing discs from database...");
		const existingDiscs = await getAllDiscs();
		console.log(`${existingDiscs.length} existing discs in database.`);
		return existingDiscs;
	} catch (error) {
		throw new Error(`${error} - Error backing up existing discs.`);
	}
};

const getDiscs = async () => {
	try {
		console.log(`Fetching discs from ${DISC_FETCH_URL}...`);
		const { ok, body, status, statusText } = await fetch(DISC_FETCH_URL);
		if (!ok) throw `Bad response status: ${status} ${statusText}`;
		const dom = new JSDOM(await Bun.readableStreamToText(body), { virtualConsole });
		const discCollection = dom.window.document.getElementsByClassName(Site.discClass);
		const putterCollection = dom.window.document.getElementsByClassName(Site.putterClass);
		console.log(`${discCollection.length + putterCollection.length} discs fetched.`);
		return { discCollection, putterCollection } as IDiscCollections;
	} catch (error) {
		throw new Error(`${error} - Error fetching disc data from '${DISC_FETCH_URL}'.`);
	}
};

const processDiscs = (collections: IDiscCollections) => {
	try {
		console.log("Processing fetched discs...");
		const discsToInsert: IDisc[] = [];

		// distance drivers, hybrid drivers, control drivers, midranges
		for (const element of collections.discCollection) {
			const name = element.getAttribute(Site.discNameAttr);
			const brand = element.getAttribute(Site.brandAttr);
			const id = hashString(element.getAttribute(Site.idAttr));
			const category = parseCategory(element.getAttribute(Site.categoryAttr));
			const speed = parseDecimalString(element.getAttribute(Site.speedAttr));
			const glide = parseDecimalString(element.getAttribute(Site.glideAttr));
			const turn = parseDecimalString(element.getAttribute(Site.turnAttr));
			const fade = parseDecimalString(element.getAttribute(Site.fadeAttr));
			const stability = parseStability(element, turn, fade);
			const link = element.getAttribute(Site.linkAttr);
			const pic = element.getAttribute(Site.discPicAttr);
			const name_slug = slugify(name);
			const brand_slug = slugify(brand);
			const category_slug = slugify(category);
			const stability_slug = slugify(stability);
			const color = element.getAttribute(Site.colorAttr);
			const background_color = element.getAttribute(Site.backgroundColorAttr);

			const disc = {
				id,
				name,
				brand,
				category,
				speed,
				glide,
				turn,
				fade,
				stability,
				link,
				pic,
				name_slug,
				brand_slug,
				category_slug,
				stability_slug,
				color,
				background_color
			} as IDisc;

			if (discMeetsMinCriteria(disc)) discsToInsert.push(disc);
		}

		// putters
		for (const element of collections.putterCollection) {
			const name = element.getAttribute(Site.putterNameAttr);
			const brand = element.getAttribute(Site.brandAttr);
			const id = hashString(name + brand);
			const category = "Putter";
			const speed = parseDecimalString(element.getAttribute(Site.speedAttr));
			const glide = parseDecimalString(element.getAttribute(Site.glideAttr));
			const turn = parseDecimalString(element.getAttribute(Site.turnAttr));
			const fade = parseDecimalString(element.getAttribute(Site.fadeAttr));
			const stability = parseStability(element, turn, fade);
			const link = element.getAttribute(Site.linkAttr);
			const pic = element.getAttribute(Site.putterPicAttr);
			const name_slug = slugify(name);
			const brand_slug = slugify(brand);
			const category_slug = slugify(category);
			const stability_slug = slugify(stability);
			const color = element.getAttribute(Site.colorAttr);
			const background_color = element.getAttribute(Site.backgroundColorAttr);

			const disc = {
				id,
				name,
				brand,
				category,
				speed,
				glide,
				turn,
				fade,
				stability,
				link,
				pic,
				name_slug,
				brand_slug,
				category_slug,
				stability_slug,
				color,
				background_color
			} as IDisc;

			if (discMeetsMinCriteria(disc)) discsToInsert.push(disc);
		}

		// check for duplicate name_slug values and append a number to the end of one of the duplicates if found
		const nameSlugSet = new Set<string>();
		discsToInsert.forEach((disc, i, discsToInsertRef) => {
			let { name_slug } = disc;
			if (nameSlugSet.has(name_slug)) {
				console.warn(`Duplicate name_slug found: "${name_slug}"`);
				const lastChar = name_slug.slice(-1);
				const lastCharNum = "0123456789".includes(lastChar) ? parseInt(lastChar) : null;
				const numToAppend = typeof lastCharNum === "number" ? lastCharNum + 1 : 2;
				name_slug = `${name_slug.slice(0, -1)}${numToAppend}`;
				discsToInsertRef[i].name_slug = name_slug;
				console.warn(`Renamed to: "${name_slug}"`);
			}
			nameSlugSet.add(name_slug);
		});

		console.log(
			`${discsToInsert.length}/${
				collections.discCollection.length + collections.putterCollection.length
			} fetched discs meet insert criteria.`
		);
		return discsToInsert;
	} catch (error) {
		throw new Error(`${error} - Error processing fetched disc data.`);
	}
};

const doDeleteAllDiscs = async () => {
	try {
		console.log("Deleting all existing discs...");
		const { ok, status, statusText } = await deleteAllDiscs();
		if (!ok) throw `Bad response status: ${status} ${statusText}`;
		console.log("All existing discs deleted.");
	} catch (error) {
		throw new Error(`${error} - Error deleting existing discs from database.`);
	}
};

const doInsertDiscs = async (discsToInsert: IDisc[]) => {
	try {
		console.log(`Inserting ${discsToInsert.length} discs...`);
		const { ok, status, statusText } = await insertDiscs(discsToInsert);
		if (!ok) throw `Bad response status: ${status} ${statusText}`;
		console.log(`${discsToInsert.length} discs inserted.`);
	} catch (error) {
		throw new Error(`${error} - Error inserting discs into database.`);
	}
};

const doRevalidateDiscItCache = async () => {
	try {
		if (!Config.DISCIT_URL) {
			console.log("DISCIT_URL env var is not defined. Skipping DiscIt cache revalidation.");
			return;
		}
		console.log("Revalidating DiscIt cache...");
		const { ok, status } = await revalidateDiscItCache();
		if (!ok) throw `Bad response status: ${status}`;
		console.log("DiscIt cache revalidated.");
	} catch (error) {
		throw new Error(`${error} - Error revalidating DiscIt cache.`);
	}
};
