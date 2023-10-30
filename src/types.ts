/// <reference lib="dom" />

export interface IConfig {
	API_BASE_URL: string;
	API_KEY: string;
	REFRESH_DISCS_START: boolean;
	REFRESH_DISCS_CRON: boolean;
}

export interface IDisc {
	id: string;
	name: string;
	brand: string;
	category: string;
	speed: string;
	glide: string;
	turn: string;
	fade: string;
	stability: string;
	link: string;
	pic: string;
	name_slug: string;
	brand_slug: string;
	category_slug: string;
	stability_slug: string;
	color: string;
	background_color: string;
}

export interface IDiscCollections {
	discCollection: HTMLCollectionOf<Element>;
	putterCollection: HTMLCollectionOf<Element>;
}
