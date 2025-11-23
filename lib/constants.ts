export const UNIVERSITIES = [
  "Bahria University Karachi",
  "IBA (Institute of Business Administration)",
  "FAST NUCES",
  "NED University",
  "University of Karachi",
  "Aga Khan University",
  "PAF Aeromodelling Club",
  "COMSATS University",
  "Habib University",
]

export const VENDOR_CATEGORIES = [
  { id: "restaurant", label: "Restaurants" },
  { id: "cafe", label: "Cafes" },
  { id: "arcade", label: "Arcades" },
  { id: "bowling", label: "Bowling" },
  { id: "clothing", label: "Clothing" },
  { id: "other", label: "Other" },
]

export const DISCOUNT_TYPES = [
  { id: "percentage", label: "Percentage Off" },
  { id: "fixed_amount", label: "Fixed Amount" },
]

export const SUBSCRIPTION_TIERS = [
  {
    id: "free",
    name: "Free Trial",
    duration: 7,
    price: 0,
    discount: 0,
  },
  {
    id: "monthly",
    name: "Monthly",
    duration: 30,
    price: 999,
    discount: 0,
  },
  {
    id: "semester",
    name: "Semester",
    duration: 120,
    price: 2999,
    discount: 10,
  },
  {
    id: "yearly",
    name: "Yearly",
    duration: 365,
    price: 5999,
    discount: 20,
  },
]
