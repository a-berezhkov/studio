
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Laptop } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";

const getLaptopFormSchema = (isEditing: boolean) => z.object({
  login: z.string().min(1, { message: "Login is required." }),
  password: isEditing 
    ? z.string().optional() // Password optional for editing, empty string means clear, undefined/not present means no change by handler
    : z.string().min(1, { message: "Password is required." }), // Password required for new laptops
});


// This type should encompass all possible fields, then schema refines it
type LaptopFormValues = {
  login: string;
  password?: string; // Make password optional here to align with schema possibilities
};

interface LaptopFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: LaptopFormValues, laptopId?: string) => void;
  initialData?: Laptop;
}

export function LaptopFormDialog({ open, onOpenChange, onSubmit, initialData }: LaptopFormDialogProps) {
  const form = useForm<LaptopFormValues>({
    resolver: zodResolver(getLaptopFormSchema(!!initialData)),
    defaultValues: initialData ? { login: initialData.login, password: initialData.password || "" } : { login: "", password: "" },
  });

  useEffect(() => {
    // Reset form when initialData changes or dialog opens/closes
    if (open) {
      if (initialData) {
        form.reset({ login: initialData.login, password: initialData.password || "" });
      } else {
        form.reset({ login: "", password: "" });
      }
    }
  }, [initialData, form, open]);


  const handleSubmit = (data: LaptopFormValues) => {
    // For editing, if password field is empty, it means "don't change" or "set to empty"
    // The parent onSubmit handler will decide based on `data.password` being an empty string vs. a new value.
    // If isEditing and data.password is empty, it implies user wants to clear or did not touch.
    // The schema allows optional password for edit. If it's not in `data` (e.g. if a field was truly optional and not rendered),
    // it would be `undefined`. However, our form always has the field.
    // So `data.password` will be string (empty or valued).
    onSubmit(data, initialData?.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Laptop" : "Add New Laptop"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Update the details for this laptop. Leave password blank to keep current." : "Enter the login and password for the new laptop."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="login"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Login/ID</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Laptop01, AssetTag123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder={initialData ? "Leave blank to keep current" : "Enter password"} 
                      {...field} 
                      value={field.value ?? ""} // Ensure value is not undefined for input
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">{initialData ? "Save Changes" : "Add Laptop"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
