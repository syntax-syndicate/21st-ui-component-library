import React from "react"
import { UseFormReturn } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { FormData } from "./utils"
import { useVideoDropzone } from "./hooks/use-video-dropzone"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import UploadIcon from "@/components/UploadIcon"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

export const DemoDetailsForm = ({
  form,
}: {
  form: UseFormReturn<FormData>
}) => {
  const { resolvedTheme } = useTheme()
  const isDarkTheme = resolvedTheme === "dark"
  const previewImageDataUrl = form.watch("preview_image_data_url")

  const {
    previewVideoDataUrl,
    isProcessingVideo,
    isVideoDragActive,
    getVideoRootProps,
    getVideoInputProps,
    removeVideo,
    openFileDialog,
  } = useVideoDropzone({ form })

  const handleFileChange = (event: { target: { files: File[] } }) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File is too large. Maximum size is 5 MB.")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        form.setValue("preview_image_data_url", e.target?.result as string)
      }
      reader.readAsDataURL(file)
      form.setValue("preview_image_file", file)
    }
  }

  const {
    getRootProps: getImageRootProps,
    getInputProps: getImageInputProps,
    isDragActive: isImageDragActive,
  } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        handleFileChange({ target: { files: acceptedFiles } })
      }
    },
    accept: {
      "image/jpeg": [],
      "image/png": [],
    },
    multiple: false,
  })

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="space-y-6">
        <div className="w-full">
          <Label htmlFor="preview_image" className="block text-sm font-medium">
            Cover Image (1200x900 recommended)
          </Label>
          {!previewImageDataUrl ? (
            <div
              {...getImageRootProps()}
              className={`flex flex-col !justify-between mt-1 w-full border border-dashed bg-background rounded-md p-8 text-center cursor-pointer hover:border-gray-400 transition-colors relative`}
            >
              <input {...getImageInputProps()} id="preview_image" />
              <UploadIcon />
              <p className="mt-2 text-sm font-medium">
                Click to upload&nbsp;
                <span className="text-muted-foreground font-normal">
                  or drag and drop
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                PNG, JPEG (max. 5MB)
              </p>
              {isImageDragActive && (
                <div className="absolute inset-0 bg-background bg-opacity-90 flex items-center justify-center rounded-md">
                  <p className="text-sm text-muted-foreground">
                    Drop image here
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div
              {...getImageRootProps()}
              className={`mt-1 w-full border ${
                isDarkTheme ? "border-gray-600" : "border-gray-300"
              } rounded-md p-2 flex items-center gap-2 relative`}
            >
              <input {...getImageInputProps()} id="preview_image" />
              <div className="w-40 h-32 relative">
                <img
                  src={previewImageDataUrl}
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
                          })
                        }
                      }
                      input.click()
                    }}
                  >
                    Change cover
                  </Button>
                  <div className="h-px bg-border w-full" />
                  <span className="text-sm text-muted-foreground self-center">
                    or drop it here
                  </span>
                </div>
              </div>
              {isImageDragActive && (
                <div className="absolute inset-0 bg-background bg-opacity-90 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    Drop new image here
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="w-full">
          <div className="flex items-center justify-between">
            <Label htmlFor="preview_video" className="text-sm font-medium">
              Video Preview
            </Label>
            <span className="text-sm text-muted-foreground">Optional</span>
          </div>
          {!previewVideoDataUrl ? (
            <div
              {...getVideoRootProps()}
              className={`flex flex-col !justify-between mt-1 w-full border border-dashed bg-background rounded-md p-8 text-center cursor-pointer hover:border-gray-400 transition-colors relative`}
            >
              <input {...getVideoInputProps()} id="preview_video" />
              <UploadIcon />
              <p className="mt-2 text-sm font-medium">
                Click to upload&nbsp;
                <span className="text-muted-foreground font-normal">
                  or drag and drop
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                MOV, MP4 (max. 50MB)
              </p>
              {isProcessingVideo && (
                <div className="absolute inset-0 bg-background bg-opacity-90 flex items-center justify-center rounded-md">
                  <p className="text-sm text-muted-foreground">
                    Processing video...
                  </p>
                </div>
              )}
              {isVideoDragActive && (
                <div className="absolute inset-0 bg-background bg-opacity-90 flex items-center justify-center rounded-md">
                  <p className="text-sm text-muted-foreground">
                    Drop video here
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div
              className={cn(
                "mt-1 w-full border rounded-md p-2 flex items-center gap-2 relative",
                isDarkTheme ? "border-gray-600" : "border-gray-300",
              )}
            >
              <div className="w-40 h-32 relative">
                <video
                  src={previewVideoDataUrl}
                  controls
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
                  <Button variant="outline" onClick={openFileDialog}>
                    Change video
                  </Button>
                  <Button variant="outline" onClick={removeVideo}>
                    Remove video
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
