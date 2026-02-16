"use client";

import { z } from "zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { SelectDropdown } from "@/components/select-dropdown";
import { User } from "@/types/user";
import { useAuth } from "@/context/auth-context";

/* -------------------------------------------------------------------------- */
/*                                   Schema                                   */
/* -------------------------------------------------------------------------- */

const formSchema = z.object({
    // employeeId: z.string().min(1, "Employee ID is required."),
    name: z.string().min(1, "Name is required."),
    mobile: z.string().min(10, "Mobile number is required."),
    email: z.string().email("Invalid email address."),
    role: z.number().min(1, "Role is required."),
    roleDescription: z.string().min(1, "Role description is required."),
    password: z.string().optional(),
});

type EmployeeForm = z.infer<typeof formSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentRow?: User;
}

/* -------------------------------------------------------------------------- */
/*                              Component                                     */
/* -------------------------------------------------------------------------- */

export function EmployeeMutateDrawer({
    open,
    onOpenChange,
    currentRow,
}: Props) {
    const isUpdate = !!currentRow;
    const { user } = useAuth();
    const form = useForm<EmployeeForm>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            // employeeId: "",
            name: "",
            mobile: "",
            email: "",
            role: 1,
            roleDescription: "",
            password: "",
        },
    });

    /* -------------------------------------------------------------------------- */
    /*                         Sync form on edit                                  */
    /* -------------------------------------------------------------------------- */

    useEffect(() => {
        if (currentRow) {
            form.reset({
                // employeeId: currentRow.employeeId,
                name: currentRow.name,
                mobile: currentRow.mobile,
                email: currentRow.email,
                role: Number(currentRow.role),
                roleDescription: currentRow.roleDescription,
                password: "",
            });
        } else {
            form.reset();
        }
    }, [currentRow, form]);

    /* -------------------------------------------------------------------------- */
    /*                               Submit                                       */
    /* -------------------------------------------------------------------------- */

    const onSubmit = async (data: EmployeeForm) => {
        try {
            if (isUpdate) {
                await axios.put("/api/employees", {
                    id: currentRow.id,
                    employeeId: currentRow.employeeId,
                    companyId: user?.companyId,
                    name: data.name,
                    email: data.email,
                    mobile: data.mobile,
                    role: data.role,
                    roleDescription: data.roleDescription,
                });


                toast.success("Employee updated successfully");
            } else {
                await axios.post("/api/employees/create", {
                    ...data,
                    companyId: user?.companyId,
                }, {
                    headers: { "Content-Type": "application/json" },
                });

                toast.success("Employee created successfully");
            }

            onOpenChange(false);
            form.reset();
        } catch (error: any) {
            console.error(error);
            toast.error(error?.message || "Something went wrong");
        }
    };

    /* -------------------------------------------------------------------------- */
    /*                                   UI                                       */
    /* -------------------------------------------------------------------------- */

    return (
        <Sheet
            open={open}
            onOpenChange={(v) => {
                onOpenChange(v);
                if (!v) form.reset();
            }}
        >
            <SheetContent className="flex flex-col overflow-y-auto">
                <SheetHeader className="text-left">
                    <SheetTitle>
                        {isUpdate ? "Update Employee" : "Create Employee"}
                    </SheetTitle>
                    <SheetDescription>
                        {isUpdate
                            ? "Edit employee details and save changes."
                            : "Add a new employee to the system."}
                    </SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form
                        id="employee-form"
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex-1 space-y-5"
                    >
                        {/* <FormField
                            control={form.control}
                            name="employeeId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Employee ID</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="EMP001" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        /> */}

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="John Doe" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="mobile"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mobile</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="9876543210" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="email" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <SelectDropdown
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                        placeholder="Select role"
                                        items={[
                                            { label: "Admin", value: 1 },
                                            { label: "HR", value: 2 },
                                            { label: "Employee", value: 3 },
                                        ]}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="roleDescription"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role Description</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Describe the role" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {!isUpdate && (
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="password" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </form>
                </Form>

                <SheetFooter className="gap-2">
                    <SheetClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </SheetClose>
                    <Button form="employee-form" type="submit">
                        Save
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
