
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Student, Group } from "@/lib/types";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from "react";

const studentFormSchema = z.object({
  name: z.string().min(1, { message: "Student name is required." }),
  groupId: z.string().min(1, { message: "Group is required." }),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

interface StudentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: StudentFormValues, studentId?: string) => void;
  initialData?: Student;
  groups: Group[]; // Added groups prop
}

export function StudentFormDialog({ open, onOpenChange, onSubmit, initialData, groups }: StudentFormDialogProps) {
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: initialData ? { name: initialData.name, groupId: initialData.groupId } : { name: "", groupId: groups[0]?.id || "" },
  });

 useEffect(() => {
    if (open) {
        if (initialData) {
          form.reset({ name: initialData.name, groupId: initialData.groupId });
        } else {
          form.reset({ name: "", groupId: groups[0]?.id || "" });
        }
    }
  }, [initialData, groups, form, open]);

  const handleSubmit = (data: StudentFormValues) => {
    onSubmit(data, initialData?.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Student" : "Add New Student"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Update the student's details and group." : "Enter the name and assign a group for the new student."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="groupId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger disabled={groups.length === 0}>
                        <SelectValue placeholder="Select a group" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {groups.length === 0 && <SelectItem value="" disabled>No groups available. Please add a group first.</SelectItem>}
                      {groups.map(group => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={groups.length === 0}>{initialData ? "Save Changes" : "Add Student"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
