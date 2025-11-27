import { PrismaClient } from "@prisma/client";

declare const process: { exit: (code?: number) => void };

const prisma = new PrismaClient();

const categoriesData = [
  {
    name: "Groceries",
    slug: "groceries",
    subcategories: [
      { name: "Rice & Grains", slug: "rice-grains" },
      { name: "Fruits & Vegetables", slug: "fruits-vegetables" },
      { name: "Dairy & Eggs", slug: "dairy-eggs" },
      { name: "Meat & Seafood", slug: "meat-seafood" },
      { name: "Snacks & Beverages", slug: "snacks-beverages" },
      { name: "Cooking Essentials", slug: "cooking-essentials" },
      { name: "Bakery & Bread", slug: "bakery-bread" },
    ],
  },
  {
    name: "Electronics",
    slug: "electronics",
    subcategories: [
      { name: "Smartphones", slug: "smartphones" },
      { name: "Laptops & Computers", slug: "laptops-computers" },
      { name: "Home Appliances", slug: "home-appliances" },
      { name: "Cameras & Photography", slug: "cameras-photography" },
      { name: "Audio & Headphones", slug: "audio-headphones" },
      { name: "Smart Devices", slug: "smart-devices" },
    ],
  },
  {
    name: "Fashion",
    slug: "fashion",
    subcategories: [
      { name: "Men's Clothing", slug: "mens-clothing" },
      { name: "Women's Clothing", slug: "womens-clothing" },
      { name: "Kids' Clothing", slug: "kids-clothing" },
      { name: "Footwear", slug: "footwear" },
      { name: "Accessories", slug: "accessories" },
      { name: "Jewelry & Watches", slug: "jewelry-watches" },
    ],
  },
  {
    name: "Home & Living",
    slug: "home-living",
    subcategories: [
      { name: "Furniture", slug: "furniture" },
      { name: "Home Decor", slug: "home-decor" },
      { name: "Kitchen & Dining", slug: "kitchen-dining" },
      { name: "Bedding & Linen", slug: "bedding-linen" },
      { name: "Storage & Organization", slug: "storage-organization" },
    ],
  },
  {
    name: "Beauty & Personal Care",
    slug: "beauty-personal-care",
    subcategories: [
      { name: "Skincare", slug: "skincare" },
      { name: "Makeup", slug: "makeup" },
      { name: "Hair Care", slug: "hair-care" },
      { name: "Fragrances", slug: "fragrances" },
      { name: "Personal Hygiene", slug: "personal-hygiene" },
    ],
  },
  {
    name: "Books & Stationery",
    slug: "books-stationery",
    subcategories: [
      { name: "Books", slug: "books" },
      { name: "Office Supplies", slug: "office-supplies" },
      { name: "Art & Craft", slug: "art-craft" },
      { name: "School Supplies", slug: "school-supplies" },
    ],
  },
  {
    name: "Sports & Fitness",
    slug: "sports-fitness",
    subcategories: [
      { name: "Exercise Equipment", slug: "exercise-equipment" },
      { name: "Sports Gear", slug: "sports-gear" },
      { name: "Fitness Accessories", slug: "fitness-accessories" },
      { name: "Outdoor Recreation", slug: "outdoor-recreation" },
    ],
  },
];

async function main() {
  console.log("Starting seed...");

  for (const categoryData of categoriesData) {
    const { subcategories, ...category } = categoryData;

    const createdCategory = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: {
        name: category.name,
        slug: category.slug,
      },
    });

    console.log(`Created/Updated category: ${createdCategory.name}`);

    for (const subcategory of subcategories) {
      await prisma.subcategory.upsert({
        where: {
          categoryId_slug: {
            categoryId: createdCategory.id,
            slug: subcategory.slug,
          },
        },
        update: {},
        create: {
          name: subcategory.name,
          slug: subcategory.slug,
          categoryId: createdCategory.id,
        },
      });

      console.log(`  - Created/Updated subcategory: ${subcategory.name}`);
    }
  }

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
