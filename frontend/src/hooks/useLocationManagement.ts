import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import type { Location } from "../types/location";
import type { LocationFormData } from "../types/forms";
import { getErrorMessage } from "../utils/getErrorMessage.ts";
import { useToast } from "../context/ToastContext.tsx";

const { showToast } = useToast();
const emptyLocationForm: LocationFormData = { name: "", address: "", phone: "", email: "" };

function useLocationManagement() {
    const [locations, setLocations] = useState<Location[]>([]);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<Location | null>(null);
    const [locationForm, setLocationForm] = useState<LocationFormData>(emptyLocationForm);

    const loadLocations = async () => {
        try {
            const res = await axiosInstance.get<Location[]>("/admin/locations");
            setLocations(res.data);
        } catch (error) {
            showToast(getErrorMessage(error));
        }
    };

    useEffect(() => {
        loadLocations();
    }, []);

    const openCreateLocation = () => {
        setEditingLocation(null);
        setLocationForm(emptyLocationForm);
        setIsLocationModalOpen(true);
    };

    const openEditLocation = (loc: Location) => {
        setEditingLocation(loc);
        setLocationForm({
            name: loc.name,
            address: loc.address,
            phone: loc.phone ?? "",
            email: loc.email ?? "",
        });
        setIsLocationModalOpen(true);
    };

    const closeLocationModal = () => {
        setIsLocationModalOpen(false);
        setEditingLocation(null);
        setLocationForm(emptyLocationForm);
    };

    const handleSaveLocation = async () => {
        if (!locationForm.name.trim() || !locationForm.address.trim()) return;
        try {
            if (editingLocation) {
                await axiosInstance.put(`/admin/locations/${editingLocation.id}`, locationForm);
            } else {
                await axiosInstance.post("/admin/locations", locationForm);
            }
            closeLocationModal();
            await loadLocations();
        } catch (error) {
            showToast(getErrorMessage(error));
        }
    };

    const handleDeleteLocation = async (id: number) => {
        try {
            await axiosInstance.delete(`/admin/locations/${id}`);
            await loadLocations();
        } catch (error) {
            showToast(getErrorMessage(error));
        }
    };

    return {
        locations,
        isLocationModalOpen,
        editingLocation,
        locationForm,
        setLocationForm,
        openCreateLocation,
        openEditLocation,
        closeLocationModal,
        handleSaveLocation,
        handleDeleteLocation,
    };
}

export default useLocationManagement;