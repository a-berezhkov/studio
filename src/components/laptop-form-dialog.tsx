
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

const laptopFormSchema = z.object({
  login: z.string().min(1, { message: "Login is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LaptopFormValues = z.infer<typeof laptopFormSchema>;

interface LaptopFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: LaptopFormValues, laptopId?: string) => void;
  initialData?: Laptop;
}

export function LaptopFormDialog({ open, onOpenChange, onSubmit, initialData }: LaptopFormDialogProps) {
  const form = useForm<LaptopFormValues>({
    resolver: zodResolver(laptopFormSchema),
    defaultValues: initialData ? { login: initialData.login, password: initialData.password || "" } : { login: "", password: "" },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({ login: initialData.login, password: initialData.password || "" });
    } else {
      form.reset({ login: "", password: "" });
    }
  }, [initialData, form, open]);


  const handleSubmit = (data: LaptopFormValues) => {
    onSubmit(data, initialData?.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Laptop" : "Add New Laptop"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Update the details for this laptop." : "Enter the login and password for the new laptop."}
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
                    <Input type="password" placeholder="Enter password" {...field} />
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
