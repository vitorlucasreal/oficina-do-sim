import { Product } from "../../types";

export interface AdminProduct extends Product {
  active: boolean;
  legacy_id?: string | null;
}
