import { notFound } from "next/navigation";
import EditServiceForm from "@/features/admin/services/edit";
import { serviceService } from "@/lib/services/service.service";
import { productService } from "@/lib/services/product.service";

interface ServiceEditPageProps {
  params: {
    id: string;
  };
}

export default async function ServiceEditPage({ params }: ServiceEditPageProps) {
  const [service, products] = await Promise.all([
    serviceService.getServiceById(params.id),
    productService.getAllProducts(),
  ]);

  if (!service) {
    notFound();
  }

  return <EditServiceForm id={params.id} initialData={service} products={products} />;
}
