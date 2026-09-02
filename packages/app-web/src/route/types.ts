import { IRender } from "../view/index.js";

export type Method = "get" | "post" | "put" | "delete";
export interface CommonRouteOption {}
export interface GetRouteOption {
	render: IRender;
}
export interface PostRouteOption {}
export interface PutRouteOption {}
export interface DeleteRouteOption {}
export interface SubRouteOption {}
