import { addMonths, toISO, today } from '../utils/warranty';

// Demo data is generated relative to today's date so the warranty statuses
// (Active / Expiring Soon / Expired) always match the current date.
const make = (n, name, brand, model, serial, category, months, expiryOffsetDays, seller, price, addedDaysAgo) => {
  const exp = today();
  exp.setDate(exp.getDate() + expiryOffsetDays);
  const purchase = addMonths(exp, -months);
  const created = new Date(Date.now() - addedDaysAgo * 86400000);
  return {
    id: `demo_${n}`,
    name, brand, model, serial, category,
    purchaseDate: toISO(purchase),
    warrantyMonths: months,
    seller, price,
    invoice: null,
    createdAt: created.toISOString(),
  };
};

export const buildDemoProducts = () => [
  make(1, 'Laptop', 'Lenovo', 'IdeaPad Slim 5', 'LNV-5G8821', 'Electronics', 24, 300, 'Croma, Banjara Hills', 68990, 1),
  make(2, 'Smartphone', 'Samsung', 'Galaxy S23 FE', 'SMS-S23-44109', 'Mobile', 12, 150, 'Samsung Store, Hitech City', 49999, 2),
  make(3, 'Refrigerator', 'LG', 'GL-S292', 'LG-REF-770245', 'Home Appliances', 24, 18, 'Reliance Digital, Kukatpally', 31490, 4),
  make(4, 'Smart TV', 'Sony', 'Bravia KD-43X75L', 'SNY-TV-903317', 'Electronics', 12, -75, 'Sony Center, Begumpet', 54990, 6),
  make(5, 'Washing Machine', 'Whirlpool', 'Xpert Care 8 kg', 'WPL-WM-118842', 'Home Appliances', 36, 520, 'Vijay Sales, Ameerpet', 28900, 9),
  make(6, 'Headphones', 'boAt', 'Rockerz 450', 'BOAT-RK450-6612', 'Accessories', 12, 9, 'Amazon India', 1499, 12),
  make(7, 'Tablet', 'Apple', 'iPad 10th Gen', 'APL-IPD-30157', 'Electronics', 12, 210, 'Apple Authorised Reseller', 39900, 15),
  make(8, 'Air Conditioner', 'Daikin', 'FTKM50 1.5 Ton', 'DKN-AC-502913', 'Home Appliances', 24, -120, 'Daikin Showroom, Madhapur', 44990, 20),
];

const ago = (mins) => new Date(Date.now() - mins * 60000).toISOString();
export const buildDemoActivity = () => [
  { id: 'a1', type: 'add', text: 'Added Lenovo Laptop', at: ago(60 * 20) },
  { id: 'a2', type: 'add', text: 'Added Samsung Smartphone', at: ago(60 * 44) },
  { id: 'a3', type: 'alert', text: 'LG Refrigerator is expiring soon', at: ago(60 * 72) },
  { id: 'a4', type: 'alert', text: 'boAt Headphones is expiring soon', at: ago(60 * 96) },
  { id: 'a5', type: 'alert', text: 'Sony Smart TV warranty expired', at: ago(60 * 24 * 75) },
];
