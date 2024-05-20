import { Config } from "./config";

import type { IDisc } from "./types";

const headers = { Authorization: `Bearer ${Config.API_KEY}` };

export const getAllDiscs = async () => (await fetch(`${Config.API_BASE_URL}/disc`)).json() as Promise<IDisc[]>;

export const insertDiscs = (discs: IDisc[]) =>
	fetch(`${Config.API_BASE_URL}/disc`, {
		method: "POST",
		headers,
		body: JSON.stringify(discs)
	});

export const deleteAllDiscs = () =>
	fetch(`${Config.API_BASE_URL}/disc`, {
		method: "DELETE",
		headers
	});
