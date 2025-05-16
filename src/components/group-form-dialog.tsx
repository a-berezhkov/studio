
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Group } from "@/lib/types";
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

const groupFormSchema = z.object({
  name: z.string().min(1, { message: "Group name is required." }),
});

type GroupFormValues = z.infer<typeof groupFormSchema>;

interface GroupFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: GroupFormValues, groupId?: string) => void;
  initialData?: Group;
}

export function GroupFormDialog({ open, onOpenChange, onSubmit, initialData }: GroupFormDialogProps) {
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: initialData || { name: "" },
  });

 useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset(initialData);
      } else {
        form.reset({ name: "" });
      }
    }
  }, [initialData, form, open]);

  const handleSubmit = (data: GroupFormValues) => {
    onSubmit(data, initialData?.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Group" : "Add New Group"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Update the group's name." : "Enter the name for the new group."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Morning Class, Advanced Batch" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">{initialData ? "Save Changes" : "Add Group"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
