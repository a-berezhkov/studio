
"use client";

import type { Laptop, Student, Desk } from "@/lib/types";
import type { DeskActionData } from "@/app/page"; 
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { Laptop as LaptopIcon, User, Edit, KeyRound, StickyNote, PlusCircle, UserMinus } from "lucide-react";

interface DeskActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deskActionData: DeskActionData | null;
  onEditLaptop: (laptop: Laptop) => void;
  onViewCredentials: (laptop: Laptop) => void;
  onAssignStudent: (laptop: Laptop) => void;
  onUnassignStudent: (laptopId: string) => void;
  onSaveNotes: (laptopId: string, notes: string) => void;
  onAddLaptopToDesk: (desk: Desk) => void;
  isAdminAuthenticated: boolean;
}

export function DeskActionModal({
  open,
  onOpenChange,
  deskActionData,
  onEditLaptop,
  onViewCredentials,
  onAssignStudent,
  onUnassignStudent,
  onSaveNotes,
  onAddLaptopToDesk,
  isAdminAuthenticated,
}: DeskActionModalProps) {
  const [currentNotes, setCurrentNotes] = useState("");

  useEffect(() => {
    if (deskActionData?.laptop) {
      setCurrentNotes(deskActionData.laptop.notes || "");
    } else {
      setCurrentNotes("");
    }
  }, [deskActionData]);

  if (!deskActionData) return null;

  const { desk, laptop, student } = deskActionData;

  const handleSaveNotes = () => {
    if (laptop && isAdminAuthenticated) {
      onSaveNotes(laptop.id, currentNotes);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle>Desk {desk.id} Actions</DialogTitle>
          {laptop ? (
            <DialogDescription>
              Manage laptop <span className="font-semibold">{laptop.login}</span>
              {student ? ` assigned to ${student.name}.` : "."}
            </DialogDescription>
          ) : (
            <DialogDescription>This desk is currently empty.</DialogDescription>
          )}
        </DialogHeader>

        <div className="py-4 space-y-4">
          {laptop ? (
            <>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                  <LaptopIcon className="mr-2 h-4 w-4" /> Laptop Actions
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => onEditLaptop(laptop)} disabled={!isAdminAuthenticated}>
                    <Edit className="mr-2 h-4 w-4" /> Edit Details
                  </Button>
                  <Button variant="outline" onClick={() => onViewCredentials(laptop)}>
                    <KeyRound className="mr-2 h-4 w-4" /> View Credentials
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                  <User className="mr-2 h-4 w-4" /> Student Assignment
                </h3>
                {student ? (
                  <div className="space-y-2">
                     <p className="text-sm">Assigned to: <span className="font-semibold">{student.name}</span> ({student.groupNumber})</p>
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" onClick={() => onAssignStudent(laptop)} disabled={!isAdminAuthenticated}>
                            <User className="mr-2 h-4 w-4" /> Change Student
                        </Button>
                        <Button variant="outline" onClick={() => { onUnassignStudent(laptop.id); }} disabled={!isAdminAuthenticated}>
                            <UserMinus className="mr-2 h-4 w-4" /> Unassign Student
                        </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" className="w-full" onClick={() => onAssignStudent(laptop)} disabled={!isAdminAuthenticated}>
                    <User className="mr-2 h-4 w-4" /> Assign Student
                  </Button>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                  <StickyNote className="mr-2 h-4 w-4" /> Laptop Notes
                </h3>
                <Textarea
                  placeholder="Enter notes for this laptop..."
                  value={currentNotes}
                  onChange={(e) => setCurrentNotes(e.target.value)}
                  className="min-h-[80px]"
                  disabled={!isAdminAuthenticated}
                />
                <Button onClick={handleSaveNotes} size="sm" className="mt-2" disabled={!isAdminAuthenticated}>
                  Save Notes
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <p className="text-muted-foreground mb-4">This desk is empty.</p>
              <Button onClick={() => onAddLaptopToDesk(desk)} disabled={!isAdminAuthenticated}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Laptop to this Desk
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    