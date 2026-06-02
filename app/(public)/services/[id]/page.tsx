import { notFound } from "next/navigation";
import ServiceDetails from "@/features/common/service-details";
import { connectDB } from "@/lib/db/mongoose";
import Service from "@/lib/models/Service";

export const revalidate = 60;

interface ServicePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ServicePageProps) {
  const { id } = await params;
  await connectDB();
  const service = await Service.findById(id).lean() as any;
  if (!service) return { title: "Service Not Found" };
  return { title: service.name, description: service.description };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { id } = await params;
  await connectDB();

  const raw = await Service.findById(id)
    .populate("includedProducts.productId", "name price")
    .lean() as any;

  if (!raw) notFound();

  const service = {
    _id: String(raw._id),
    name: raw.name,
    description: raw.description,
    basePrice: raw.basePrice,
    includedProducts: (raw.includedProducts || []).map((item: any) => ({
      productId: {
        _id: String(item.productId._id),
        name: item.productId.name,
        price: item.productId.price,
      },
      quantity: item.quantity || 1,
    })),
    totalPrice:
      raw.basePrice +
      (raw.includedProducts || []).reduce(
        (sum: number, item: any) =>
          sum + (item.productId?.price || 0) * (item.quantity || 1),
        0
      ),
  };

  return <ServiceDetails service={service} />;
}
