import Services from "@/features/common/services";
import { serviceService } from "@/lib/services/service.service";
import { connectDB } from "@/lib/db/mongoose";
import Service from "@/lib/models/Service";

export const revalidate = 60;

export const metadata = {
  title: "Services",
  description: "Browse our professional parlour services",
};

async function getData() {
  await connectDB();

  const services = await Service.find({})
    .sort({ createdAt: -1 })
    .populate("includedProducts.productId", "name price")
    .lean();

  return services.map((s: any) => ({
    _id: String(s._id),
    name: s.name,
    description: s.description,
    basePrice: s.basePrice,
    includedProducts: (s.includedProducts || []).map((item: any) => ({
      productId: {
        _id: String(item.productId._id),
        name: item.productId.name,
        price: item.productId.price,
      },
      quantity: item.quantity || 1,
    })),
    totalPrice:
      s.basePrice +
      (s.includedProducts || []).reduce(
        (sum: number, item: any) =>
          sum + (item.productId?.price || 0) * (item.quantity || 1),
        0
      ),
  }));
}

export default async function ServicesPage() {
  const services = await getData();
  return <Services services={services} />;
}
