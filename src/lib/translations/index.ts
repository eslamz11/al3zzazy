import { coreDict } from "./core";
import { productDict } from "./product";
import { catalogDict } from "./catalog";
import { checkoutDict } from "./checkout";
import { accountDict } from "./account";
import { homeDict } from "./home";
import { pagesDict } from "./pages";

/**
 * Single merged translation dictionary.
 *
 * Namespaces live in separate files so each area of the storefront can grow
 * without turning this into one unmanageable object:
 *
 * - `core`      shared chrome: header, footer, nav, generic actions & states
 * - `product`   product card, quick view, product detail page
 * - `catalog`   collection listings, category pages, search
 * - `checkout`  cart, checkout, confirmation, order status labels
 * - `account`   auth screens and the customer account area
 * - `home`      homepage sections
 * - `pages`     about, contact and policy pages
 */
export const dict = {
  ...coreDict,
  ...productDict,
  ...catalogDict,
  ...checkoutDict,
  ...accountDict,
  ...homeDict,
  ...pagesDict,
};

export type TranslationKey = keyof typeof dict;
