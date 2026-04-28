import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ServicesList } from "@/components/modules/admin/services/list";
import { serviceService } from "@/lib/services/service.service";

export const revalidate = 60;

export default async function ServicesPage() {
  const services = await serviceService.getAllServices();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-600 mt-1">Manage parlour services</p>
        </div>
        <Link href="/admin/services/new">
          <Button>Add Service</Button>
        </Link>
      </div>

      <ServicesList services={services} />
    </div>
  );
}
