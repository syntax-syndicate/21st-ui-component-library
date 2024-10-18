/* eslint-disable @next/next/no-img-element */
import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react"
import { Controller, useController, UseFormReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Hotkey } from "@/components/ui/hotkey"
import {
  makeSlugFromName,
  generateUniqueSlug,
  useIsCheckSlugAvailable,
} from "./useIsCheckSlugAvailable"
import { FormData } from "./utils"
import { useDropzone } from "react-dropzone"
import { CloudUpload } from "lucide-react"
import { Check, ChevronsUpDown } from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useClerkSupabaseClient } from "@/utils/clerk"
import { useAvailableTags } from "@/utils/dbQueries"
import { useTheme } from "next-themes"
import { useUser } from "@clerk/nextjs"
import { licenses } from "@/utils/licenses"
import { TagSelector } from "../TagSelector"
import { Separator } from "@radix-ui/react-separator"

interface ComponentDetailsFormProps {
  isEditMode?: boolean
  form: UseFormReturn<FormData>
  previewImage: string | null
  // eslint-disable-next-line no-unused-vars
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  // eslint-disable-next-line no-unused-vars
  handleSubmit: (event: React.FormEvent) => void
  isLoading: boolean
  // eslint-disable-next-line no-unused-vars
  isFormValid: (...args: any[]) => boolean
  internalDependencies: Record<string, string>
  componentName: string | null
}

export interface ComponentDetailsFormRef {
  focusNameInput: () => void
}

const ComponentDetailsForm = forwardRef<
  ComponentDetailsFormRef,
  ComponentDetailsFormProps
>(
  (
    {
      isEditMode,
      form,
      previewImage,
      handleFileChange,
      handleSubmit,
      isLoading,
      isFormValid,
      internalDependencies,
      componentName,
    },
    ref,
  ) => {
    const client = useClerkSupabaseClient()
    const { data: availableTags = [] } = useAvailableTags()
    const { theme } = useTheme()
    const isDarkTheme = theme === "dark"
    const { user } = useUser()

    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false)
    const {
      isAvailable: slugAvailable,
      isChecking: isSlugChecking,
      error: slugError,
    } = useIsCheckSlugAvailable({
      slug: form.watch("component_slug"),
      userId: user?.id ?? "",
    })

    const [license, setLicense] = useState("mit")
    const [open, setOpen] = useState(false)

    const nameInputRef = useRef<HTMLInputElement | null>(null)
    const { field: nameField } = useController({
      name: "name",
      control: form.control,
      rules: { required: true },
    })

    useImperativeHandle(ref, () => ({
      focusNameInput: () => {
        if (nameInputRef.current) {
          nameInputRef.current.focus()
        }
      },
    }))

    useEffect(() => {
      const timer = setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus()
        }
      }, 100)

      return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
      if (!isEditMode) {
        const prefillAutogeneratedSlug = async () => {
          if (
            form.getValues("name") &&
            (!form.getValues("component_slug") ||
              (!isSlugManuallyEdited && slugAvailable === false))
          ) {
            const slug = await generateUniqueSlug(
              client,
              form.getValues("name"),
              user?.id ?? "",
            )
            form.setValue("component_slug", slug)
            setIsSlugManuallyEdited(false)
          }
        }

        prefillAutogeneratedSlug()
      }
    }, [form.watch("name"), isEditMode])

    const onDrop = useCallback(
      (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
          handleFileChange({ target: { files: acceptedFiles } } as any)
        }
      },
      [handleFileChange],
    )

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: {
        "image/jpeg": [],
        "image/png": [],
      },
      multiple: false,
    })

    return (
      <div
        className={`flex flex-col gap-4 w-full ${isDarkTheme ? "text-foreground" : "text-gray-700"}`}
      >
        <div className="w-full">
          <label htmlFor="name" className="block text-sm font-medium">
            Name
          </label>
          <Input
            id="name"
            ref={(e) => {
              nameField.ref(e)
              nameInputRef.current = e
            }}
            placeholder={
              componentName
                ? `For example "${componentName.replace(/([a-z])([A-Z])/g, "$1 $2")}"`
                : "Button"
            }
            value={nameField.value}
            onChange={(e) => {
              nameField.onChange(e)
              const generatedSlug = makeSlugFromName(e.target.value)
              form.setValue("component_slug", generatedSlug)
            }}
            onBlur={nameField.onBlur}
            className="mt-1 w-full"
          />
        </div>

        <div className="w-full">
          <label htmlFor="description" className="block text-sm font-medium">
            Description
          </label>
          <Input
            id="description"
            placeholder="Add some description to help others find your component"
            {...form.register("description")}
            className="mt-1 w-full"
          />
        </div>

        <div className="w-full">
          <Label htmlFor="preview_image" className="block text-sm font-medium">
            Cover Image (1200x900 recommended)
          </Label>
          {!previewImage ? (
            <div
              {...getRootProps()}
              className={`flex !justify-between mt-1 w-full border border-dashed bg-background rounded-md p-8 text-center cursor-pointer hover:border-gray-400 transition-colors relative`}
            >
              <input {...getInputProps()} id="preview_image" />
              <CloudUpload strokeWidth={1.5} className="mx-auto h-10 w-10" />
              <p className="mt-2 text-sm font-semibold">
                Click to upload&nbsp;
                <span className="text-gray-600 font-normal">
                  or drag and drop
                </span>
              </p>
              <p className="mt-1 text-xs text-gray-500">PNG, JPEG (max. 5MB)</p>
              {isDragActive && (
                <div className="absolute inset-0 bg-background bg-opacity-90 flex items-center justify-center rounded-md">
                  <p className="text-sm text-gray-600">Drop image here</p>
                </div>
              )}
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`mt-1 w-full border ${
                isDarkTheme ? "border-gray-600" : "border-gray-300"
              } rounded-md p-2 flex items-center gap-2 relative`}
            >
              <input {...getInputProps()} id="preview_image" />
              <div className="w-40 h-32 relative">
                <img
                  src={previewImage}
                  alt="Preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  className="rounded-sm border shadow-sm"
                />
              </div>
              <div className="flex flex-col items-start">
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      const input = document.createElement("input")
                      input.type = "file"
                      input.accept = "image/jpeg, image/png"
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0]
                        if (file) {
                          handleFileChange({
                            target: { files: [file] },
                          } as any)
                        }
                      }
                      input.click()
                    }}
                  >
                    Change cover
                  </Button>
                  <Separator
                    orientation="horizontal"
                    className="w-full h-[1px] bg-border"
                  />
                  <span className="text-sm text-muted-foreground self-center">
                    or drop it here
                  </span>
                </div>
              </div>
              {isDragActive && (
                <div className="absolute inset-0 bg-background bg-opacity-90 flex items-center justify-center">
                  <p className="text-sm text-gray-600">Drop new image here</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="w-full mt-4">
          <label htmlFor="license" className="block text-sm font-medium">
            License
          </label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between mt-1 h-9"
              >
                {license
                  ? licenses.find((l) => l.value === license)?.label
                  : "Select license..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Select license..." />
                <CommandList>
                  <CommandEmpty>No licenses found</CommandEmpty>
                  <CommandGroup>
                    {licenses.map((l) => (
                      <CommandItem
                        key={l.value}
                        value={l.value}
                        onSelect={(currentValue) => {
                          setLicense(
                            currentValue === license ? "" : currentValue,
                          )
                          form.setValue(
                            "license",
                            currentValue === license ? "" : currentValue,
                          )
                          setOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            license === l.value ? "opacity-100" : "opacity-0",
                          )}
                        />
                        {l.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="w-full">
          <label htmlFor="tags" className="block text-sm font-medium">
            Tags (optional)
          </label>
          <Controller
            name="tags"
            control={form.control}
            defaultValue={[]}
            render={({ field }) => {
              const [tags, setTags] = useState<
                { name: string; slug: string; id?: number }[]
              >(field.value)

              const createTag = (inputValue: string) => ({
                name: inputValue,
                slug: makeSlugFromName(inputValue),
                id: undefined,
              })

              return (
                <TagSelector
                  availableTags={availableTags}
                  selectedTags={tags}
                  onChange={(newTags) => {
                    setTags(newTags)
                    field.onChange(newTags)
                  }}
                  getValue={(tag) => tag.slug}
                  getLabel={(tag) => tag.name}
                  createTag={createTag}
                />
              )
            }}
          />
        </div>

        {!isEditMode && (
          <div className="w-full">
            <label
              htmlFor="component_slug"
              className="block text-sm font-medium"
            >
              Slug
            </label>
            <Input
              id="component_slug"
              {...form.register("component_slug", { required: true })}
              className="mt-1 w-full"
              onChange={(e) => {
                setIsSlugManuallyEdited(true)
                form.setValue("component_slug", e.target.value)
              }}
            />

            {isSlugManuallyEdited && (
              <>
                {isSlugChecking ? (
                  <p className="text-gray-500 text-sm mt-1">
                    Checking availability...
                  </p>
                ) : slugError ? (
                  <p className="text-red-500 text-sm mt-1">
                    {slugError.message}
                  </p>
                ) : slugAvailable === true ? (
                  <p className="text-green-500 text-sm mt-1">
                    This slug is available
                  </p>
                ) : null}
              </>
            )}
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={
            isLoading ||
            !isFormValid(form, internalDependencies, slugAvailable === true)
          }
        >
          {isLoading
            ? isEditMode
              ? "Saving..."
              : "Adding..."
            : isEditMode
              ? "Save changes"
              : "Add component"}
          {!isLoading &&
            isFormValid(form, internalDependencies, slugAvailable === true) && (
              <Hotkey keys={["⌘", "⏎"]} isBackgroundDark={true} />
            )}
        </Button>
      </div>
    )
  },
)

export { ComponentDetailsForm }