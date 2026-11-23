import type { Supplier } from "@/types";

export const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: "sup-1",
    name: "Smart Technologies (BD) Ltd",
    contactPerson: "Md. Jahangir Alam (Head of Enterprise Sales)",
    phone: "+8801711002233",
    email: "procurement@smartbd.com",
    address:
      "Jahangir Tower, 10 Kazi Nazrul Islam Avenue, Karwan Bazar, Dhaka-1215",
    distributorOf: ["ASUS", "HP", "Gigabyte", "Intel", "Corsair"],
  },
  {
    id: "sup-2",
    name: "UCC (Universal Computer Consultants)",
    contactPerson: "Kamrul Hasan (Distributor Manager)",
    phone: "+8801819223344",
    email: "sales@ucc-bd.com",
    address: "BCS Computer City, IDB Bhaban, Level 4, Agargaon, Dhaka-1207",
    distributorOf: ["AMD", "Sapphire", "MSI", "Transcend", "ViewSonic"],
  },
  {
    id: "sup-3",
    name: "Global Brand PLC",
    contactPerson: "Farhana Chowdhury (Key Account Lead)",
    phone: "+8801912445566",
    email: "commercial@globalbrand.com.bd",
    address: "19/2 West Panthapath, Dhanmondi, Dhaka-1205",
    distributorOf: ["ASUS ROG", "Kingston", "Dell", "Brother", "LG"],
  },
  {
    id: "sup-4",
    name: "Star Tech Distribution Ltd",
    contactPerson: "Zubair Rahman (Wholesale Dept)",
    phone: "+8801733556677",
    email: "wholesale@startech.com.bd",
    address: "New Elephant Road, Multiplan Center, Level 9, Dhaka-1205",
    distributorOf: ["Intel", "Zotac", "G.Skill", "Thermaltake", "DeepCool"],
  },
  {
    id: "sup-5",
    name: "Excel Technologies Ltd",
    contactPerson: "Tanvir Hossain (Sales Manager)",
    phone: "+8801611889900",
    email: "orders@excel-bd.com",
    address: "Eastern Plus Shopping Complex, 5th Floor, Shantinagar, Dhaka",
    distributorOf: ["Western Digital", "TP-Link", "Antec", "Hikvision"],
  },
];
