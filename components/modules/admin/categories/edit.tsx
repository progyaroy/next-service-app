"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Form } from "@/components/ui/form";
import { FormField } from "@/components/ui/form-field";
import { TextInput } from "@/components/ui/input";
import { TextArea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { updateCategory } from "@/lib/actions/admin";

export default function EditCategory() {
  const params = useParams();
  const id = params.id as string;
  const [state, formAction, isPending] = useActionState(
    (prevState: any, formData: FormData) => updateCategory(id, prevState, formData),
    { error: "" }
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Category</h1>
        <p className="text-gray-600 mt-1">Update category information</p>
      </div>

      <Form action={formAction} className="max-w-2xl">
        <FormField id="name" label="Category Name">
          <TextInput
            name="name"
            placeholder="e.g., Electronics"
            required
          />
        </FormField>

        <FormField id="description" label="Description">
          <TextArea
            name="description"
            placeholder="Category description"
            rows={4}
          />
        </FormField>

        {state.error && <FormAlert>{state.error}</FormAlert>}

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isPending} loading={isPending}>
            {isPending ? "Updating..." : "Update Category"}
          </Button>
          <Link href="/admin/categories">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </Form>
    </div>
  );
}
