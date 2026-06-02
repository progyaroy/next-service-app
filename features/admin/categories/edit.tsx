"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Form } from "@/components/ui/form";
import { FormField } from "@/components/ui/form-field";
import { TextInput } from "@/components/ui/input";
import { TextArea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { updateCategory } from "@/lib/actions/admin";

interface EditCategoryFormProps {
  id: string;
  initialData: any;
}

export default function EditCategoryForm({ id, initialData }: EditCategoryFormProps) {
  const [state, formAction, isPending] = useActionState(
    (prevState: any, formData: FormData) => updateCategory(id, prevState, formData),
    { error: "" }
  );

  return (
    <Form action={formAction} className="max-w-2xl">
      <FormField id="name" label="Category Name">
        <TextInput
          name="name"
          placeholder="e.g., Electronics"
          defaultValue={initialData.name}
          required
        />
      </FormField>

      <FormField id="description" label="Description">
        <TextArea
          name="description"
          placeholder="Category description"
          defaultValue={initialData.description || ""}
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
  );
}
