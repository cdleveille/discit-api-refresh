import { JSDOM } from "jsdom";

import { deleteAllDiscs, getAllDiscs, insertDiscs } from "./api";
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

export const refreshDiscs = async () => {
	try {
		console.log("*** START *** - disc refresh process starting.");
		const existingDiscs = await backupDiscs();
		const discCollections = await getDiscs();
		const discsToInsert = processDiscs(discCollections);
		if (discsToInsert.length >= existingDiscs.length) {
			await doDeleteAllDiscs();
			await doInsertDiscs(discsToInsert);
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
		const { ok, body, status } = await fetch(DISC_FETCH_URL);
		if (!ok) throw `Bad response status: ${status}`;
		const dom = new JSDOM(await Bun.readableStreamToText(body));
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
		await deleteAllDiscs();
		console.log("All existing discs deleted.");
	} catch (error) {
		throw new Error(`${error} - Error deleting existing discs from database.`);
	}
};

const doInsertDiscs = async (discsToInsert: IDisc[]) => {
	try {
		console.log(`Inserting ${discsToInsert.length} discs...`);
		await insertDiscs(discsToInsert);
		console.log(`${discsToInsert.length} discs inserted.`);
	} catch (error) {
		throw new Error(`${error} - Error inserting discs into database.`);
	}
};
