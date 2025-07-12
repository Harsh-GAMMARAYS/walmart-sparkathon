// Department mapping for organizing categories into logical groups
export const DEPARTMENT_MAPPING: Record<string, string[]> = {
  "Women's Clothing": [
    "Women's Clothing",
    "Women's Fashion",
    "Dresses",
    "Tops & Blouses",
    "Pants & Leggings",
    "Skirts",
    "Swimwear",
    "Lingerie & Underwear",
    "Sleepwear & Loungewear",
    "Activewear",
    "Plus Size",
    "Maternity"
  ],
  "Men's Clothing": [
    "Men's Clothing",
    "Men's Fashion", 
    "Shirts",
    "Pants & Jeans",
    "Suits & Blazers",
    "Activewear & Athletic",
    "Underwear & Undershirts",
    "Big & Tall"
  ],
  "Shoes & Accessories": [
    "Shoes",
    "Women's Shoes",
    "Men's Shoes", 
    "Bags & Accessories",
    "Jewelry",
    "Watches",
    "Sunglasses",
    "Belts",
    "Hats & Caps",
    "Scarves & Wraps"
  ],
  "Kids & Baby": [
    "Kids' Clothing",
    "Baby Clothing",
    "Children's Shoes",
    "Toys",
    "Baby Care",
    "Kids' Accessories"
  ],
  "Home & Garden": [
    "Home Décor",
    "Furniture",
    "Kitchen & Dining",
    "Bedding",
    "Bath",
    "Storage & Organization",
    "Garden & Patio",
    "Tools & Hardware"
  ],
  "Electronics": [
    "Electronics",
    "Cell Phones",
    "Computers",
    "TV & Audio",
    "Video Games",
    "Cameras",
    "Smart Home",
    "Wearable Tech"
  ],
  "Health & Beauty": [
    "Health & Beauty",
    "Personal Care",
    "Makeup",
    "Skincare",
    "Hair Care",
    "Vitamins & Supplements",
    "Medical Supplies"
  ],
  "Sports & Outdoors": [
    "Sports & Recreation",
    "Outdoor Recreation",
    "Exercise & Fitness",
    "Camping & Hiking",
    "Water Sports",
    "Team Sports"
  ]
};

// Function to get department for a given category
export function getDepartmentForCategory(category: string): string {
  for (const [department, categories] of Object.entries(DEPARTMENT_MAPPING)) {
    if (categories.some(cat => 
      cat.toLowerCase().includes(category.toLowerCase()) || 
      category.toLowerCase().includes(cat.toLowerCase())
    )) {
      return department;
    }
  }
  return "Other"; // Default department for unmapped categories
}

// Function to get all unique departments from a list of categories
export function getDepartmentsFromCategories(categories: string[]): string[] {
  const departments = new Set<string>();
  categories.forEach(category => {
    departments.add(getDepartmentForCategory(category));
  });
  return Array.from(departments).sort();
}

// Function to filter categories by department
export function getCategoriesForDepartment(department: string, allCategories: string[]): string[] {
  if (department === "Other") {
    // Return categories that don't match any known department
    return allCategories.filter(category => {
      for (const categories of Object.values(DEPARTMENT_MAPPING)) {
        if (categories.some(cat => 
          cat.toLowerCase().includes(category.toLowerCase()) || 
          category.toLowerCase().includes(cat.toLowerCase())
        )) {
          return false;
        }
      }
      return true;
    });
  }
  
  const departmentCategories = DEPARTMENT_MAPPING[department] || [];
  return allCategories.filter(category =>
    departmentCategories.some(cat => 
      cat.toLowerCase().includes(category.toLowerCase()) || 
      category.toLowerCase().includes(cat.toLowerCase())
    )
  );
} 