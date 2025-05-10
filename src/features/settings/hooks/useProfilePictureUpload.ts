"use client"

import { PLACEHOLDER_PIC } from '@/config/variables';
import compressImg from '@/lib/utils/compressImg';
import { fileToFileList } from '@/lib/utils/helper';
import { ActionResponse } from '@/types/action';
import { profilePictureSchema, ProfilePictureType } from '@/types/schemas/settings';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form';
import { generatePresignedUploadUrl, GenerateUrlResponse } from '../actions/generatePresignedUploadUrl';
import updateUserProfileImage from '../actions/updateUserProfileImage';
import deleteUserImageOnS3 from '../actions/deleteUserImageOnS3';

export default function useProfilePictureUpload(initialImgUrl: string | null) {
  const [optimisticImgUrl, setOptimisticImgUrl] = useState(initialImgUrl);
    const [previewImgUrl, setPreviewImgUrl] = useState<string | null>(
        initialImgUrl || PLACEHOLDER_PIC
    );
    const [isFormOpen, setFormOpen] = useState(false);
    const [response, setResponse] = useState<ActionResponse | null>(null);
  
    const abortControllerRef = useRef<AbortController | null>(null);
  
    const {
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
        trigger,
    } = useForm<ProfilePictureType>({
        resolver: zodResolver(profilePictureSchema),
    });
  
    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const originalFile = e.target.files?.[0];
        if (!originalFile) return;
        try {
            const optimizedFile = await compressImg({ file: originalFile });
            const optimizedFileList = fileToFileList(optimizedFile);
  
            if (previewImgUrl) URL.revokeObjectURL(previewImgUrl);
            setPreviewImgUrl(URL.createObjectURL(optimizedFile));
  
            setValue("image", optimizedFileList);
            trigger("image");
        } catch (err) {
            console.error("Image compression failed:", err);
  
            if (previewImgUrl) URL.revokeObjectURL(previewImgUrl);
            setPreviewImgUrl(null);
  
            setValue("image", undefined);
            trigger("image");
  
            const inputElement = e.target;
            inputElement.value = "";
        }
    }
  
    async function onSubmit(formData: ProfilePictureType) {
        const file = formData.image?.[0];
  
        if (!file) {
            setResponse({ success: false, message: "You need to upload a picture." });
            return;
        }
  
        if (!file.type.includes("image")) {
            setResponse({
                success: false,
                message: "Your file needs to be an image file.",
            });
            return;
        }
  
        let presignedResponse: GenerateUrlResponse | undefined = undefined;
        try {
            presignedResponse = await generatePresignedUploadUrl({
                fileName: file.name,
                fileType: file.type,
            });
            setFormOpen(false);
        } catch (err) {
            console.error("Failed to generate presigned upload url:", err);
            setResponse({
                success: false,
                message: "Failed to generate presigned upload url.",
            });
            throw err;
        }
  
        if (
            presignedResponse &&
            presignedResponse.signedUrl &&
            presignedResponse.finalImageUrl
        ) {
            let s3UploadSuccessful = false;
            try {
                abortControllerRef.current = new AbortController();
  
                await fetch(presignedResponse.signedUrl, {
                    method: "PUT",
                    body: file,
                    headers: {
                        "Content-type": file.type,
                    },
                    signal: abortControllerRef.current.signal,
                });
                s3UploadSuccessful = true;
  
                setOptimisticImgUrl(presignedResponse?.finalImageUrl || initialImgUrl);
                await updateUserProfileImage({
                    imageUrl: presignedResponse.finalImageUrl,
                });
                await deleteUserImageOnS3({ imageUrlToDelete: initialImgUrl });
            } catch (err: any) {
                const newImageUrl = presignedResponse.finalImageUrl;
                setOptimisticImgUrl(initialImgUrl);
  
                if (s3UploadSuccessful) {
                    console.warn(
                        "DB update failed. Attempting to delete newly uploaded image from S3:",
                        newImageUrl
                    );
                    try {
                        await deleteUserImageOnS3({ imageUrlToDelete: newImageUrl }); // Or your specific delete function
                    } catch (rollbackErr) {
                        console.error(
                            "CRITICAL: Rollback failed to delete new image from S3:",
                            rollbackErr
                        );
                    }
                    setResponse({
                        success: false,
                        message: "Failed to update profile information.",
                    });
                } else {
                    setResponse({
                        success: false,
                        message: "Failed to upload image to S3.",
                    });
                    console.error("Failed to upload image to S3:", err);
                }
                if (err.name === "AbortError") {
                    setResponse({ success: false, message: "Upload cancelled by user." });
                }
                throw err;
            } finally {
                abortControllerRef.current = null;
            }
        }
    }
  
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    return {
        handleSubmit: handleSubmit(onSubmit),
        errors,
        isSubmitting,
        optimisticImgUrl,
        response,
        isFormOpen,
        setFormOpen,
        handleFileChange,
        previewImgUrl,
    }
}



