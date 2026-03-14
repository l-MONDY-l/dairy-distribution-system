'use client';

import { useEffect, useRef, useState } from 'react';
import AppLayout from '@/components/layout/app-layout';
import {
  createCity,
  createDistrict,
  createRegion,
  createTown,
  deleteTownAssignment,
  deleteCity,
  deleteDistrict,
  deleteRegion,
  deleteTown,
  getAssignmentOptions,
  getCities,
  getDistricts,
  getRegions,
  getTowns,
  getTownAssignments,
  updateCity,
  updateDistrict,
  updateRegion,
  updateTown,
  upsertTownAssignment,
} from '@/lib/regions-api';
import type { AssignmentOption } from '@/lib/regions-api';
import type { City, District, Region, Town } from '@/lib/types';

type ModalMode = 'create' | 'edit' | null;

type EditableRegion = Pick<Region, 'id' | 'name' | 'status'>;
type EditableDistrict = Pick<District, 'id' | 'name' | 'status' | 'regionId'> & {
  regionName?: string;
};
type EditableCity = Pick<City, 'id' | 'name' | 'status' | 'regionId'> & {
  regionName?: string;
  districtId?: string | null;
  districtName?: string;
};
type EditableTown = Pick<Town, 'id' | 'name' | 'status' | 'cityId'> & {
  cityName?: string;
  regionId?: string;
  districtId?: string | null;
};

export default function RegionsPage() {
  const [regions, setRegions] = useState<EditableRegion[]>([]);
  const [districts, setDistricts] = useState<EditableDistrict[]>([]);
  const [cities, setCities] = useState<EditableCity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Province (Region) modal
  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [provinceMode, setProvinceMode] = useState<ModalMode>(null);
  const [provinceName, setProvinceName] = useState('');
  const [editingProvinceId, setEditingProvinceId] = useState<string | null>(null);
  const [provinceSaving, setProvinceSaving] = useState(false);
  const [provinceModalError, setProvinceModalError] = useState('');
  const [deleteProvinceConfirm, setDeleteProvinceConfirm] = useState<EditableRegion | null>(null);
  const [provinceModalFilter, setProvinceModalFilter] = useState('');

  // District modal
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [districtMode, setDistrictMode] = useState<ModalMode>(null);
  const [districtName, setDistrictName] = useState('');
  const [districtRegionId, setDistrictRegionId] = useState('');
  const [editingDistrictId, setEditingDistrictId] = useState<string | null>(null);
  const [districtSaving, setDistrictSaving] = useState(false);
  const [districtModalError, setDistrictModalError] = useState('');
  const [deleteDistrictConfirm, setDeleteDistrictConfirm] = useState<EditableDistrict | null>(null);
  const [districtModalFilter, setDistrictModalFilter] = useState('');

  // City modal (cities under district: province → district → city)
  const [showCityModal, setShowCityModal] = useState(false);
  const [cityMode, setCityMode] = useState<ModalMode>(null);
  const [cityName, setCityName] = useState('');
  const [cityRegionId, setCityRegionId] = useState<string>('');
  const [cityDistrictId, setCityDistrictId] = useState<string>('');
  const [editingCityId, setEditingCityId] = useState<string | null>(null);
  const [citySaving, setCitySaving] = useState(false);
  const [cityModalError, setCityModalError] = useState('');
  const [deleteCityConfirm, setDeleteCityConfirm] = useState<EditableCity | null>(null);
  const [cityModalFilter, setCityModalFilter] = useState('');

  // Town modal (towns under city: province → district → city → town)
  const [towns, setTowns] = useState<EditableTown[]>([]);
  const [showTownModal, setShowTownModal] = useState(false);
  const [townMode, setTownMode] = useState<ModalMode>(null);
  const [townName, setTownName] = useState('');
  const [townRegionId, setTownRegionId] = useState('');
  const [townDistrictId, setTownDistrictId] = useState('');
  const [townCityId, setTownCityId] = useState('');
  const [editingTownId, setEditingTownId] = useState<string | null>(null);
  const [townSaving, setTownSaving] = useState(false);
  const [townModalError, setTownModalError] = useState('');
  const [deleteTownConfirm, setDeleteTownConfirm] = useState<EditableTown | null>(null);
  const [townModalFilter, setTownModalFilter] = useState('');

  // Assign agent and drivers — one town = one agent + one driver; no duplicate towns
  type AssignmentRow = {
    townId: string;
    townName: string;
    cityId: string;
    cityName: string;
    agentId: string;
    driverId: string;
  };
  const [showAssignSection, setShowAssignSection] = useState(false);
  const [agents, setAgents] = useState<AssignmentOption[]>([]);
  const [drivers, setDrivers] = useState<AssignmentOption[]>([]);
  const [assignmentRows, setAssignmentRows] = useState<AssignmentRow[]>([]);
  const [townSearchQuery, setTownSearchQuery] = useState('');
  const [selectedTownId, setSelectedTownId] = useState('');
  const [assignSaving, setAssignSaving] = useState<string | null>(null);
  const [removeAssignRow, setRemoveAssignRow] = useState<AssignmentRow | null>(null);
  // Table filters (smart search)
  const [filterTown, setFilterTown] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterAgentId, setFilterAgentId] = useState('');
  const [filterDriverId, setFilterDriverId] = useState('');

  // CSV import/export (in modal)
  const [showImportExportModal, setShowImportExportModal] = useState(false);
  const [csvExportType, setCsvExportType] = useState<'provinces' | 'districts' | 'cities' | 'towns' | 'all'>('all');
  const [csvImportType, setCsvImportType] = useState<'provinces' | 'districts' | 'cities' | 'towns'>('provinces');
  const [csvImporting, setCsvImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void loadInitial();
  }, []);

  useEffect(() => {
    if (!showAssignSection) return;
    let cancelled = false;
    (async () => {
      setError('');
      // Refresh options when section opens (getAssignmentOptions never throws; returns [] on failure)
      const options = await getAssignmentOptions();
      if (!cancelled) {
        setAgents(options.agents);
        setDrivers(options.drivers);
      }
      // Load town assignments (one town = one agent + one driver)
      try {
        const list = await getTownAssignments();
        if (cancelled) return;
        const rows: AssignmentRow[] = list.map((a) => ({
          townId: a.townId,
          townName: a.townName,
          cityId: a.cityId,
          cityName: a.cityName,
          agentId: a.agentId,
          driverId: a.driverId,
        }));
        setAssignmentRows(rows);
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError((prev) =>
            prev ? prev : 'Failed to load assignments. You can still add towns and assign agent/driver.',
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showAssignSection]);

  const loadInitial = async () => {
    try {
      setLoading(true);
      setError('');
      const [regionsData, districtsData, citiesData, townsData] = await Promise.all([
        getRegions(),
        getDistricts(),
        getCities(),
        getTowns(),
      ]);

      const regionMap = new Map(regionsData.map((r) => [r.id, r.name]));
      setRegions(regionsData.map((r) => ({ id: r.id, name: r.name, status: r.status })));
      setDistricts(
        districtsData.map((d) => ({
          id: d.id,
          name: d.name,
          status: d.status,
          regionId: d.regionId,
          regionName: d.region?.name ?? regionMap.get(d.regionId),
        })),
      );
      setCities(
        citiesData.map((c) => ({
          id: c.id,
          name: c.name,
          status: c.status,
          regionId: c.regionId,
          regionName: c.region?.name ?? regionMap.get(c.regionId),
          districtId: c.districtId ?? c.district?.id,
          districtName: c.district?.name ?? undefined,
        })),
      );
      setTowns(
        (townsData as (Town & { city?: City })[]).map((t) => ({
          id: t.id,
          name: t.name,
          status: t.status,
          cityId: t.cityId,
          cityName: t.city?.name,
          regionId: t.city?.regionId,
          districtId: t.city?.districtId ?? t.city?.district?.id,
        })),
      );

      // Load agents and drivers for assignment dropdowns (so they are ready when section opens)
      const options = await getAssignmentOptions();
      setAgents(options.agents);
      setDrivers(options.drivers);
    } catch (err) {
      console.error(err);
      setError('Failed to load provinces, districts and cities.');
    } finally {
      setLoading(false);
    }
  };

  // Extract API error message (for banner or modal)
  const getErrorMessage = (err: unknown, fallback: string): string => {
    const ax = err as {
      response?: { status?: number; data?: { message?: string | string[]; error?: string } | string };
    };
    const data = ax.response?.data;
    let msg = fallback;
    if (data != null) {
      if (typeof data === 'string') msg = data;
      else if (Array.isArray(data.message)) msg = data.message[0] ?? data.error ?? fallback;
      else if (typeof data.message === 'string') msg = data.message;
      else if (typeof data.error === 'string') msg = data.error;
    }
    return msg;
  };

  // Set global error and show alert for 400 (used for non-modal flows)
  const setErrorAndPopupIfExists = (err: unknown, fallback: string) => {
    console.error(err);
    const msg = getErrorMessage(err, fallback);
    const status = (err as { response?: { status?: number } }).response?.status;
    setError(msg);
    if (status === 400 && msg) setTimeout(() => window.alert(msg), 0);
  };

  // Set modal error and show alert for 400 (error appears inside the modal, not behind it)
  const setModalErrorAndPopup = (
    err: unknown,
    fallback: string,
    setModalError: (s: string) => void,
  ) => {
    console.error(err);
    const msg = getErrorMessage(err, fallback);
    const status = (err as { response?: { status?: number } }).response?.status;
    setModalError(msg);
    if (status === 400 && msg) setTimeout(() => window.alert(msg), 0);
  };

  // ----- Province (Region) handlers -----

  const openProvinceCreate = () => {
    setProvinceMode('create');
    setProvinceName('');
    setEditingProvinceId(null);
    setShowProvinceModal(true);
    setProvinceModalError('');
    setError('');
    setSuccess('');
  };

  const openProvinceEdit = (r: EditableRegion) => {
    setProvinceMode('edit');
    setProvinceName(r.name);
    setEditingProvinceId(r.id);
    setShowProvinceModal(true);
    setProvinceModalError('');
    setError('');
    setSuccess('');
  };

  const closeProvinceModal = () => {
    if (provinceSaving) return;
    setShowProvinceModal(false);
    setProvinceMode(null);
    setEditingProvinceId(null);
    setProvinceName('');
    setProvinceModalFilter('');
  };

  const handleProvinceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provinceMode) return;
    const trimmed = provinceName.trim();
    if (!trimmed) {
      setProvinceModalError('Province name is required.');
      return;
    }
    try {
      setProvinceSaving(true);
      setProvinceModalError('');
      if (provinceMode === 'create') {
        const created = await createRegion(trimmed);
        setRegions((prev) => [
          ...prev,
          { id: created.id, name: created.name, status: created.status },
        ]);
        setSuccess('Province created.');
        setProvinceName('');
      } else if (editingProvinceId) {
        const updated = await updateRegion(editingProvinceId, { name: trimmed });
        setRegions((prev) =>
          prev.map((r) =>
            r.id === editingProvinceId ? { ...r, name: updated.name } : r,
          ),
        );
        setSuccess('Province updated.');
        closeProvinceModal();
      }
    } catch (err) {
      setModalErrorAndPopup(err, 'Failed to save province.', setProvinceModalError);
    } finally {
      setProvinceSaving(false);
    }
  };

  const handleToggleProvinceStatus = async (r: EditableRegion) => {
    try {
      setError('');
      const updated = await updateRegion(r.id, { status: !r.status });
      setRegions((prev) =>
        prev.map((x) => (x.id === r.id ? { ...x, status: updated.status } : x)),
      );
      setSuccess('Province status updated.');
    } catch (err) {
      console.error(err);
      setError('Failed to update province status.');
    }
  };

  const handleDeleteProvinceClick = (r: EditableRegion) => {
    setDeleteProvinceConfirm(r);
  };

  const handleDeleteProvinceConfirm = async () => {
    const r = deleteProvinceConfirm;
    if (!r) return;
    setDeleteProvinceConfirm(null);
    try {
      setError('');
      await deleteRegion(r.id);
      setRegions((prev) => prev.filter((x) => x.id !== r.id));
      setSuccess('Province deleted.');
    } catch (err) {
      console.error(err);
      setError('Failed to delete province. It may be in use.');
    }
  };

  // ----- District handlers -----

  const openDistrictCreate = () => {
    setDistrictMode('create');
    setDistrictName('');
    setDistrictRegionId(regions[0]?.id ?? '');
    setEditingDistrictId(null);
    setShowDistrictModal(true);
    setDistrictModalError('');
    setError('');
    setSuccess('');
  };

  // When a province is selected, show only its districts; when "Select province", show all
  const districtsForSelectedProvince = districtRegionId
    ? districts.filter((d) => d.regionId === districtRegionId)
    : [];
  const districtsToShowInModal = districtRegionId
    ? districtsForSelectedProvince
    : districts;

  const provinceFilterQ = provinceModalFilter.trim().toLowerCase();
  const regionsFilteredInModal = provinceFilterQ
    ? regions.filter((r) => r.name.toLowerCase().includes(provinceFilterQ))
    : regions;

  const districtFilterQ = districtModalFilter.trim().toLowerCase();
  const districtsFilteredInModal = districtFilterQ
    ? districtsToShowInModal.filter(
        (d) =>
          d.name.toLowerCase().includes(districtFilterQ) ||
          (d.regionName ?? '').toLowerCase().includes(districtFilterQ),
      )
    : districtsToShowInModal;


  const openDistrictEdit = (d: EditableDistrict) => {
    setDistrictMode('edit');
    setDistrictName(d.name);
    setDistrictRegionId(d.regionId);
    setEditingDistrictId(d.id);
    setShowDistrictModal(true);
    setDistrictModalError('');
    setError('');
    setSuccess('');
  };

  const closeDistrictModal = () => {
    if (districtSaving) return;
    setShowDistrictModal(false);
    setDistrictMode(null);
    setEditingDistrictId(null);
    setDistrictName('');
    setDistrictModalFilter('');
  };

  const handleDistrictSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!districtMode) return;
    const trimmed = districtName.trim();
    if (!trimmed) {
      setDistrictModalError('District name is required.');
      return;
    }
    if (!districtRegionId) {
      setDistrictModalError('Province is required for district.');
      return;
    }
    try {
      setDistrictSaving(true);
      setDistrictModalError('');
      if (districtMode === 'create') {
        const created = await createDistrict({
          name: trimmed,
          regionId: districtRegionId,
        });
        const regionName = regions.find((r) => r.id === created.regionId)?.name;
        setDistricts((prev) => [
          ...prev,
          {
            id: created.id,
            name: created.name,
            status: created.status,
            regionId: created.regionId,
            regionName,
          },
        ]);
        setSuccess('District created.');
        setDistrictName('');
      } else if (editingDistrictId) {
        const updated = await updateDistrict(editingDistrictId, {
          name: trimmed,
          regionId: districtRegionId,
        });
        const regionName = regions.find((r) => r.id === updated.regionId)?.name;
        setDistricts((prev) =>
          prev.map((d) =>
            d.id === editingDistrictId
              ? { ...d, name: updated.name, regionId: updated.regionId, regionName }
              : d,
          ),
        );
        setSuccess('District updated.');
        closeDistrictModal();
      }
    } catch (err) {
      setModalErrorAndPopup(err, 'Failed to save district.', setDistrictModalError);
    } finally {
      setDistrictSaving(false);
    }
  };

  const handleToggleDistrictStatus = async (d: EditableDistrict) => {
    try {
      setError('');
      const updated = await updateDistrict(d.id, { status: !d.status });
      setDistricts((prev) =>
        prev.map((x) => (x.id === d.id ? { ...x, status: updated.status } : x)),
      );
      setSuccess('District status updated.');
    } catch (err) {
      console.error(err);
      setError('Failed to update district status.');
    }
  };

  const handleDeleteDistrictClick = (d: EditableDistrict) => {
    setDeleteDistrictConfirm(d);
  };

  const handleDeleteDistrictConfirm = async () => {
    const d = deleteDistrictConfirm;
    if (!d) return;
    setDeleteDistrictConfirm(null);
    try {
      setError('');
      await deleteDistrict(d.id);
      setDistricts((prev) => prev.filter((x) => x.id !== d.id));
      setSuccess('District deleted.');
    } catch (err) {
      console.error(err);
      setError('Failed to delete district. It may be in use.');
    }
  };

  // ----- City handlers -----

  const openCityCreate = () => {
    setCityMode('create');
    setCityName('');
    const firstRegionId = regions[0]?.id ?? '';
    setCityRegionId(firstRegionId);
    const firstDistrictInRegion = districts.find((d) => d.regionId === firstRegionId);
    setCityDistrictId(firstDistrictInRegion?.id ?? '');
    setEditingCityId(null);
    setShowCityModal(true);
    setCityModalError('');
    setError('');
    setSuccess('');
  };

  const openCityEdit = (city: EditableCity) => {
    setCityMode('edit');
    setCityName(city.name);
    setCityRegionId(city.regionId);
    setCityDistrictId(city.districtId ?? districts.find((d) => d.regionId === city.regionId)?.id ?? '');
    setEditingCityId(city.id);
    setShowCityModal(true);
    setCityModalError('');
    setError('');
    setSuccess('');
  };

  const closeCityModal = () => {
    if (citySaving) return;
    setShowCityModal(false);
    setCityMode(null);
    setEditingCityId(null);
    setCityName('');
    setCityModalFilter('');
  };

  const districtsForCityProvince = cityRegionId
    ? districts.filter((d) => d.regionId === cityRegionId)
    : [];
  const citiesForSelectedDistrict = cityDistrictId
    ? cities.filter((c) => c.districtId === cityDistrictId)
    : [];
  const citiesToShowInModal = cityDistrictId ? citiesForSelectedDistrict : cities;

  const cityFilterQ = cityModalFilter.trim().toLowerCase();
  const citiesFilteredInModal = cityFilterQ
    ? citiesToShowInModal.filter(
        (c) =>
          c.name.toLowerCase().includes(cityFilterQ) ||
          (c.districtName ?? '').toLowerCase().includes(cityFilterQ) ||
          (c.regionName ?? '').toLowerCase().includes(cityFilterQ),
      )
    : citiesToShowInModal;

  const handleCitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityMode) return;

    const trimmed = cityName.trim();
    if (!trimmed) {
      setCityModalError('City name is required.');
      return;
    }
    if (!cityDistrictId) {
      setCityModalError('District is required for city.');
      return;
    }

    try {
      setCitySaving(true);
      setCityModalError('');

      if (cityMode === 'create') {
        const created = await createCity({ name: trimmed, districtId: cityDistrictId });
        const regionName =
          regions.find((r) => r.id === created.regionId)?.name ?? undefined;
        const districtName = created.district?.name ?? districts.find((d) => d.id === created.districtId)?.name;
        setCities((prev) => [
          ...prev,
          {
            id: created.id,
            name: created.name,
            status: created.status,
            regionId: created.regionId,
            regionName,
            districtId: created.districtId ?? created.district?.id,
            districtName,
          },
        ]);
        setSuccess('City created.');
        setCityName('');
      } else if (cityMode === 'edit' && editingCityId) {
        const updated = await updateCity(editingCityId, {
          name: trimmed,
          districtId: cityDistrictId,
        });
        const regionName =
          regions.find((r) => r.id === updated.regionId)?.name ?? undefined;
        const districtName = updated.district?.name ?? districts.find((d) => d.id === updated.districtId)?.name;
        setCities((prev) =>
          prev.map((c) =>
            c.id === editingCityId
              ? {
                  ...c,
                  name: updated.name,
                  regionId: updated.regionId,
                  regionName,
                  districtId: updated.districtId ?? updated.district?.id,
                  districtName,
                }
              : c,
          ),
        );
        setSuccess('City updated.');
        closeCityModal();
      }
    } catch (err: unknown) {
      setModalErrorAndPopup(err, 'Failed to save city.', setCityModalError);
    } finally {
      setCitySaving(false);
    }
  };

  const handleToggleCityStatus = async (city: EditableCity) => {
    try {
      setError('');
      const updated = await updateCity(city.id, { status: !city.status });
      setCities((prev) =>
        prev.map((c) =>
          c.id === city.id ? { ...c, status: updated.status } : c,
        ),
      );
      setSuccess('City status updated.');
    } catch (err) {
      console.error(err);
      setError('Failed to update city status.');
    }
  };

  const handleDeleteCityClick = (city: EditableCity) => {
    setDeleteCityConfirm(city);
  };

  const handleDeleteCityConfirm = async () => {
    const city = deleteCityConfirm;
    if (!city) return;
    setDeleteCityConfirm(null);
    try {
      setError('');
      await deleteCity(city.id);
      setCities((prev) => prev.filter((c) => c.id !== city.id));
      setSuccess('City deleted.');
    } catch (err) {
      console.error(err);
      setError('Failed to delete city. It might be in use.');
    }
  };

  // ----- Town handlers -----

  const openTownCreate = () => {
    setTownMode('create');
    setTownName('');
    const firstRegionId = regions[0]?.id ?? '';
    setTownRegionId(firstRegionId);
    const firstDistrict = districts.find((d) => d.regionId === firstRegionId);
    setTownDistrictId(firstDistrict?.id ?? '');
    const firstCity = cities.find((c) => c.districtId === firstDistrict?.id);
    setTownCityId(firstCity?.id ?? '');
    setEditingTownId(null);
    setShowTownModal(true);
    setTownModalError('');
    setError('');
    setSuccess('');
  };

  const openTownEdit = (town: EditableTown) => {
    setTownMode('edit');
    setTownName(town.name);
    setTownRegionId(town.regionId ?? '');
    setTownDistrictId(town.districtId ?? '');
    setTownCityId(town.cityId);
    setEditingTownId(town.id);
    setShowTownModal(true);
    setTownModalError('');
    setError('');
    setSuccess('');
  };

  const closeTownModal = () => {
    if (townSaving) return;
    setShowTownModal(false);
    setTownMode(null);
    setEditingTownId(null);
    setTownName('');
    setTownModalFilter('');
  };

  const districtsForTownProvince = townRegionId
    ? districts.filter((d) => d.regionId === townRegionId)
    : [];
  const citiesForTownDistrict = townDistrictId
    ? cities.filter((c) => c.districtId === townDistrictId)
    : [];
  // When province selected: show all towns in that province; when district: towns in district; when city: towns in city
  const townsToShowInModal = townCityId
    ? towns.filter((t) => t.cityId === townCityId)
    : townDistrictId
      ? towns.filter((t) => {
          const c = cities.find((c) => c.id === t.cityId);
          return c?.districtId === townDistrictId;
        })
      : townRegionId
        ? towns.filter((t) => {
            const c = cities.find((c) => c.id === t.cityId);
            return c?.regionId === townRegionId;
          })
        : towns;
  const townListFilterQuery = townModalFilter.trim().toLowerCase();
  const townsFilteredInModal = townListFilterQuery
    ? townsToShowInModal.filter(
        (t) =>
          t.name.toLowerCase().includes(townListFilterQuery) ||
          (t.cityName ?? '').toLowerCase().includes(townListFilterQuery),
      )
    : townsToShowInModal;

  const handleTownSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!townMode) return;
    const trimmed = townName.trim();
    if (!trimmed) {
      setTownModalError('Town name is required.');
      return;
    }
    if (!townCityId) {
      setTownModalError('City is required for town.');
      return;
    }
    try {
      setTownSaving(true);
      setTownModalError('');
      if (townMode === 'create') {
        const created = await createTown({ name: trimmed, cityId: townCityId });
        const city = cities.find((c) => c.id === created.cityId);
        setTowns((prev) => [
          ...prev,
          {
            id: created.id,
            name: created.name,
            status: created.status,
            cityId: created.cityId,
            cityName: city?.name ?? (created as Town & { city?: City }).city?.name,
            regionId: city?.regionId,
            districtId: city?.districtId,
          },
        ]);
        setSuccess('Town created.');
        setTownName('');
      } else if (townMode === 'edit' && editingTownId) {
        const updated = await updateTown(editingTownId, { name: trimmed });
        const city = cities.find((c) => c.id === updated.cityId);
        setTowns((prev) =>
          prev.map((t) =>
            t.id === editingTownId
              ? {
                  ...t,
                  name: updated.name,
                  status: updated.status,
                  cityName: city?.name ?? (updated as Town & { city?: City }).city?.name,
                  regionId: city?.regionId,
                  districtId: city?.districtId,
                }
              : t,
          ),
        );
        setSuccess('Town updated.');
        closeTownModal();
      }
    } catch (err: unknown) {
      setModalErrorAndPopup(err, 'Failed to save town.', setTownModalError);
    } finally {
      setTownSaving(false);
    }
  };

  const handleToggleTownStatus = async (town: EditableTown) => {
    try {
      setError('');
      const updated = await updateTown(town.id, { status: !town.status });
      setTowns((prev) =>
        prev.map((t) => (t.id === town.id ? { ...t, status: updated.status } : t)),
      );
      setSuccess('Town status updated.');
    } catch (err) {
      console.error(err);
      setError('Failed to update town status.');
    }
  };

  const handleDeleteTownClick = (town: EditableTown) => {
    setDeleteTownConfirm(town);
  };

  const handleDeleteTownConfirm = async () => {
    const town = deleteTownConfirm;
    if (!town) return;
    setDeleteTownConfirm(null);
    try {
      setError('');
      await deleteTown(town.id);
      setTowns((prev) => prev.filter((t) => t.id !== town.id));
      setSuccess('Town deleted.');
    } catch (err) {
      console.error(err);
      setError('Failed to delete town. It might be in use.');
    }
  };

  // ----- Assign agent and drivers (search town → add city) -----
  const townSearchMatches = townSearchQuery.trim()
    ? towns.filter(
        (t) =>
          t.name.toLowerCase().includes(townSearchQuery.trim().toLowerCase()) ||
          (t.cityName ?? '').toLowerCase().includes(townSearchQuery.trim().toLowerCase()),
      ).slice(0, 10)
    : [];

  const handleAddByTown = () => {
    if (!selectedTownId) return;
    const town = towns.find((t) => t.id === selectedTownId);
    if (!town?.cityId) return;
    // One town = one row; do not allow duplicate towns
    if (assignmentRows.some((r) => r.townId === town.id)) return;
    setAssignmentRows((prev) => [
      ...prev,
      {
        townId: town.id,
        townName: town.name,
        cityId: town.cityId,
        cityName: town.cityName ?? town.cityId,
        agentId: '',
        driverId: '',
      },
    ]);
    setSelectedTownId('');
    setTownSearchQuery('');
  };

  const handleAssignSave = async (row: AssignmentRow) => {
    if (!row.agentId || !row.driverId) {
      setError('Please select both agent and driver.');
      return;
    }
    try {
      setAssignSaving(row.townId);
      setError('');
      await upsertTownAssignment(row.townId, row.agentId, row.driverId);
      setSuccess('Assignment saved for this town.');
    } catch (err) {
      console.error(err);
      setError('Failed to save assignment.');
    } finally {
      setAssignSaving(null);
    }
  };

  const handleAssignRemoveClick = (row: AssignmentRow) => {
    setRemoveAssignRow(row);
  };

  const handleAssignRemoveConfirm = async () => {
    const row = removeAssignRow;
    if (!row) return;
    setRemoveAssignRow(null);

    const nextRows = assignmentRows.filter((r) => r.townId !== row.townId);
    try {
      setError('');
      setAssignmentRows(nextRows);
      await deleteTownAssignment(row.townId);
      setSuccess('Town removed from assignments.');
    } catch (err) {
      console.error(err);
      setAssignmentRows(assignmentRows); // revert on error
      setError('Failed to remove assignment.');
    }
  };

  const updateAssignmentRow = (townId: string, patch: Partial<AssignmentRow>) => {
    setAssignmentRows((prev) =>
      prev.map((r) => (r.townId === townId ? { ...r, ...patch } : r)),
    );
  };

  // Smart filters for assignment table (case-insensitive partial match for town/city)
  const assignmentFilteredRows = assignmentRows.filter((row) => {
    const t = filterTown.trim().toLowerCase();
    const c = filterCity.trim().toLowerCase();
    if (t && !row.townName.toLowerCase().includes(t)) return false;
    if (c && !row.cityName.toLowerCase().includes(c)) return false;
    if (filterAgentId && row.agentId !== filterAgentId) return false;
    if (filterDriverId && row.driverId !== filterDriverId) return false;
    return true;
  });

  // ----- CSV export / import -----
  const escapeCsv = (v: string) => {
    const s = String(v ?? '');
    if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const downloadCsv = (filename: string, content: string) => {
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleExportCsv = () => {
    if (csvExportType === 'all') {
      const rHeader = 'name,status\n';
      const rRows = regions.map((r) => `${escapeCsv(r.name)},${r.status}`);
      downloadCsv('provinces.csv', rHeader + rRows.join('\n'));
      const dHeader = 'name,region\n';
      const dRows = districts.map((d) => {
        const region = regions.find((x) => x.id === d.regionId);
        return `${escapeCsv(d.name)},${escapeCsv(region?.name ?? '')}`;
      });
      downloadCsv('districts.csv', dHeader + dRows.join('\n'));
      const cHeader = 'name,district,status\n';
      const cRows = cities.map((c) => {
        const district = districts.find((x) => x.id === (c.districtId ?? c.district?.id));
        return `${escapeCsv(c.name)},${escapeCsv(district?.name ?? '')},${c.status}`;
      });
      downloadCsv('cities.csv', cHeader + cRows.join('\n'));
      const tHeader = 'name,city\n';
      const tRows = towns.map((t) => `${escapeCsv(t.name)},${escapeCsv(t.cityName ?? '')}`);
      downloadCsv('towns.csv', tHeader + tRows.join('\n'));
      setSuccess('Exported provinces.csv, districts.csv, cities.csv, towns.csv.');
      return;
    }
    if (csvExportType === 'provinces') {
      const header = 'name,status\n';
      const rows = regions.map((r) => `${escapeCsv(r.name)},${r.status}`);
      downloadCsv('provinces.csv', header + rows.join('\n'));
    } else if (csvExportType === 'districts') {
      const header = 'name,region\n';
      const rows = districts.map((d) => {
        const region = regions.find((x) => x.id === d.regionId);
        return `${escapeCsv(d.name)},${escapeCsv(region?.name ?? '')}`;
      });
      downloadCsv('districts.csv', header + rows.join('\n'));
    } else if (csvExportType === 'cities') {
      const header = 'name,district,status\n';
      const rows = cities.map((c) => {
        const district = districts.find((x) => x.id === (c.districtId ?? c.district?.id));
        return `${escapeCsv(c.name)},${escapeCsv(district?.name ?? '')},${c.status}`;
      });
      downloadCsv('cities.csv', header + rows.join('\n'));
    } else if (csvExportType === 'towns') {
      const header = 'name,city\n';
      const rows = towns.map((t) => `${escapeCsv(t.name)},${escapeCsv(t.cityName ?? '')}`);
      downloadCsv('towns.csv', header + rows.join('\n'));
    }
    setSuccess(`Exported ${csvExportType}.csv`);
  };

  const parseCsv = (text: string): string[][] => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim());
    return lines.map((line) => {
      const out: string[] = [];
      let i = 0;
      while (i < line.length) {
        if (line[i] === '"') {
          let cell = '';
          i++;
          while (i < line.length) {
            if (line[i] === '"') {
              i++;
              if (line[i] === '"') {
                cell += '"';
                i++;
              } else break;
            } else {
              cell += line[i++];
            }
          }
          out.push(cell);
          if (line[i] === ',') i++;
        } else {
          const j = line.indexOf(',', i);
          if (j === -1) {
            out.push(line.slice(i).trim());
            break;
          }
          out.push(line.slice(i, j).trim());
          i = j + 1;
        }
      }
      return out;
    });
  };

  const handleImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const typeLabel = csvImportType.charAt(0).toUpperCase() + csvImportType.slice(1);
    const confirmed = window.confirm(
      `Do you really want to upload "${file.name}" as ${typeLabel}?`,
    );
    if (!confirmed) return;
    setCsvImporting(true);
    setError('');
    setImportResult(null);
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (rows.length < 2) {
        const msg = 'CSV must have a header row and at least one data row.';
        setError(msg);
        setImportResult({ type: 'error', message: msg });
        return;
      }
      const header = rows[0].map((h) => h.trim().toLowerCase());
      const data = rows.slice(1);

      if (csvImportType === 'provinces') {
        const nameIdx = header.indexOf('name');
        if (nameIdx === -1) {
          const msg = 'CSV must have a "name" column for provinces.';
          setError(msg);
          setImportResult({ type: 'error', message: msg });
          return;
        }
        let created = 0;
        let skipped = 0;
        for (const row of data) {
          const name = (row[nameIdx] ?? '').trim();
          if (!name) continue;
          if (regions.some((r) => r.name.toLowerCase() === name.toLowerCase())) {
            skipped++;
            continue;
          }
          await createRegion(name);
          created++;
        }
        const provMsg =
          skipped > 0
            ? `Imported ${created} province(s), ${skipped} already existed (skipped).`
            : `Imported ${created} province(s).`;
        setSuccess(provMsg);
        setImportResult({ type: 'success', message: provMsg });
        await loadInitial();
      } else if (csvImportType === 'districts') {
        const nameIdx = header.indexOf('name');
        const regionIdx = header.findIndex((h) => h === 'region' || h === 'regionname');
        if (nameIdx === -1) {
          const msg = 'CSV must have a "name" column for districts.';
          setError(msg);
          setImportResult({ type: 'error', message: msg });
          return;
        }
        let created = 0;
        let skipped = 0;
        for (const row of data) {
          const name = (row[nameIdx] ?? '').trim();
          const regionName = (regionIdx >= 0 ? row[regionIdx] ?? '' : '').trim();
          if (!name) continue;
          const region = regions.find((r) => r.name.toLowerCase() === regionName.toLowerCase());
          if (!region) {
            const msg = `Region not found: "${regionName}". Add provinces first.`;
            setError(msg);
            setImportResult({ type: 'error', message: msg });
            return;
          }
          if (districts.some((d) => d.name.toLowerCase() === name.toLowerCase() && d.regionId === region.id)) {
            skipped++;
            continue;
          }
          await createDistrict({ name, regionId: region.id });
          created++;
        }
        const distMsg =
          skipped > 0
            ? `Imported ${created} district(s), ${skipped} already existed (skipped).`
            : `Imported ${created} district(s).`;
        setSuccess(distMsg);
        setImportResult({ type: 'success', message: distMsg });
        await loadInitial();
      } else if (csvImportType === 'cities') {
        const nameIdx = header.indexOf('name');
        const districtIdx = header.findIndex((h) => h === 'district' || h === 'districtname');
        if (nameIdx === -1) {
          const msg = 'CSV must have a "name" column for cities.';
          setError(msg);
          setImportResult({ type: 'error', message: msg });
          return;
        }
        const currentDistricts = districts;
        const createdInRun: { name: string; districtId: string }[] = [];
        let created = 0;
        let skipped = 0;
        for (const row of data) {
          const name = (row[nameIdx] ?? '').trim();
          const districtName = (districtIdx >= 0 ? (row[districtIdx] ?? '') : '').trim();
          if (!name) continue;
          const district = currentDistricts.find((d) => d.name.toLowerCase() === districtName.toLowerCase());
          if (!district) {
            const msg = `District not found: "${districtName}". Add districts first.`;
            setError(msg);
            setImportResult({ type: 'error', message: msg });
            return;
          }
          const exists = cities.some((c) => c.name.toLowerCase() === name.toLowerCase() && (c.districtId ?? c.district?.id) === district.id)
            || createdInRun.some((x) => x.name.toLowerCase() === name.toLowerCase() && x.districtId === district.id);
          if (exists) {
            skipped++;
            continue;
          }
          await createCity({ name, districtId: district.id });
          createdInRun.push({ name, districtId: district.id });
          created++;
        }
        const cityMsg =
          skipped > 0
            ? `Imported ${created} city/cities, ${skipped} already existed (skipped).`
            : `Imported ${created} city/cities.`;
        setSuccess(cityMsg);
        setImportResult({ type: 'success', message: cityMsg });
        await loadInitial();
      } else if (csvImportType === 'towns') {
        const nameIdx = header.indexOf('name');
        const cityIdx = header.findIndex((h) => h === 'city' || h === 'cityname');
        if (nameIdx === -1) {
          const msg = 'CSV must have a "name" column for towns.';
          setError(msg);
          setImportResult({ type: 'error', message: msg });
          return;
        }
        const currentCities = cities;
        const createdInRun: { name: string; cityId: string }[] = [];
        let created = 0;
        let skipped = 0;
        const failedRows: { row: number; message: string }[] = [];
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          const rowNum = i + 2;
          const name = (row[nameIdx] ?? '').trim();
          const cityName = (cityIdx >= 0 ? (row[cityIdx] ?? '') : '').trim();
          if (!name) continue;
          const city = currentCities.find((c) => c.name.toLowerCase() === cityName.toLowerCase());
          if (!city) {
            failedRows.push({ row: rowNum, message: `City not found: "${cityName}". Add cities first.` });
            continue;
          }
          const exists = towns.some((t) => t.name.toLowerCase() === name.toLowerCase() && t.cityId === city.id)
            || createdInRun.some((x) => x.name.toLowerCase() === name.toLowerCase() && x.cityId === city.id);
          if (exists) {
            skipped++;
            continue;
          }
          try {
            await createTown({ name, cityId: city.id });
            createdInRun.push({ name, cityId: city.id });
            created++;
          } catch (err) {
            const msg = getErrorMessage(err, 'Duplicate or invalid town.');
            failedRows.push({ row: rowNum, message: msg });
            skipped++;
          }
        }
        const townErrDetail =
          failedRows.length > 0
            ? failedRows.slice(0, 5).map((f) => `Row ${f.row}: ${f.message.replace(/\n/g, ' ')}`).join(' — ') +
              (failedRows.length > 5 ? ` — and ${failedRows.length - 5} more.` : '')
            : '';
        if (failedRows.length > 0) {
          setError(townErrDetail);
          setImportResult({ type: 'error', message: townErrDetail });
        }
        const townMsg =
          failedRows.length > 0
            ? `Imported ${created} town(s), ${skipped} skipped (existing or failed).`
            : skipped > 0
              ? `Imported ${created} town(s), ${skipped} already existed (skipped).`
              : `Imported ${created} town(s).`;
        setSuccess(townMsg);
        setImportResult((prev) =>
          prev ? prev : { type: 'success', message: townMsg },
        );
        await loadInitial();
      }
    } catch (err) {
      console.error(err);
      const msg = getErrorMessage(err, err instanceof Error ? err.message : 'Failed to import CSV.');
      setError(msg);
      setImportResult({ type: 'error', message: msg });
    } finally {
      setCsvImporting(false);
    }
  };

  const triggerImportFile = () => fileInputRef.current?.click();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">
              Admin Module
            </p>
            <h1 className="mt-1 text-2xl font-bold">Territory And Region Management</h1>
            <p className="mt-1 text-sm text-slate-400">
              Manage districts and cities used for assignments.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-800/80 px-3 py-2">
            <button
              type="button"
              onClick={() => {
                setError('');
                setSuccess('');
                setImportResult(null);
                setShowImportExportModal(true);
              }}
              className="text-xs font-medium text-slate-200 hover:text-white"
            >
              Import and Export Data
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {success}
          </div>
        )}

        {/* Section: Region hierarchy (Provinces → Districts → Cities → Towns) */}
        <section className="space-y-6 rounded-3xl border border-slate-700 bg-slate-900/60 p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Region hierarchy
          </h2>
          <div className="space-y-4">
        {/* Manage Provinces */}
        <div className="flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-900 p-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Manage Provinces</h2>
            <p className="mt-1 text-xs text-slate-500">
              Western, Central, Southern, etc. Used for districts and cities.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="min-w-[3rem] rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-center text-sm font-semibold tabular-nums text-slate-200">
              {loading ? '…' : regions.length}
            </span>
            <button
              type="button"
              onClick={openProvinceCreate}
              className="rounded-2xl border border-slate-600 px-4 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-800"
            >
              Manage Provinces
            </button>
          </div>
        </div>

        {/* Manage Districts */}
        <div className="flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-900 p-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Manage Districts</h2>
            <p className="mt-1 text-xs text-slate-500">
              Sri Lanka districts linked to a province.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="min-w-[3rem] rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-center text-sm font-semibold tabular-nums text-slate-200">
              {loading ? '…' : districts.length}
            </span>
            <button
              type="button"
              onClick={openDistrictCreate}
              className="rounded-2xl border border-slate-600 px-4 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-800"
            >
              Manage Districts
            </button>
          </div>
        </div>

        {/* Manage Cities */}
        <div className="flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-900 p-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Manage Cities</h2>
            <p className="mt-1 text-xs text-slate-500">
              Cities belong to a district. Select province → district, then add or edit cities.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="min-w-[3rem] rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-center text-sm font-semibold tabular-nums text-slate-200">
              {loading ? '…' : cities.length}
            </span>
            <button
              type="button"
              onClick={openCityCreate}
              className="rounded-2xl border border-slate-600 px-4 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-800"
            >
              Manage Cities
            </button>
          </div>
        </div>

        {/* Manage Towns */}
        <div className="flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-900 p-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Manage Towns</h2>
            <p className="mt-1 text-xs text-slate-500">
              Towns belong to a city. Select province → district → city, then add or edit towns.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="min-w-[3rem] rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-center text-sm font-semibold tabular-nums text-slate-200">
              {loading ? '…' : towns.length}
            </span>
            <button
              type="button"
              onClick={openTownCreate}
              className="rounded-2xl border border-slate-600 px-4 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-800"
            >
              Manage Towns
            </button>
          </div>
        </div>
          </div>
        </section>

        {/* Section: Assignments */}
        <section className="mt-8 rounded-3xl border border-slate-700 bg-slate-900/60 p-5 pt-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Assignments
          </h2>
        {/* Assign agent and drivers */}
        <div className="flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-900 p-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Assign agent and drivers</h2>
            <p className="mt-1 text-xs text-slate-500">
              Search town and add; one town = one agent + one driver. Each town may only appear once.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAssignSection((v) => !v)}
            className="rounded-2xl border border-slate-600 px-4 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-800"
          >
            {showAssignSection ? 'Hide' : 'Assign agent and drivers'}
          </button>
        </div>

        {showAssignSection && (
          <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">
              Search town and add; assign one agent and one driver per town. Each town may only appear once.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm text-slate-300">Search town</label>
              <div className="relative">
                <input
                  type="text"
                  value={townSearchQuery}
                  onChange={(e) => {
                    setTownSearchQuery(e.target.value);
                    if (!e.target.value) setSelectedTownId('');
                  }}
                  placeholder="Type town or city name…"
                  className="rounded-2xl border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100 min-w-[220px]"
                />
                {townSearchMatches.length > 0 && (
                  <ul className="absolute left-0 top-full z-10 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-slate-600 bg-slate-900 py-1 shadow-lg">
                    {townSearchMatches.map((t) => (
                      <li key={t.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTownId(t.id);
                            setTownSearchQuery(`${t.name} (${t.cityName ?? ''})`);
                          }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-700 ${
                            selectedTownId === t.id ? 'bg-slate-700 text-slate-100' : 'text-slate-200'
                          }`}
                        >
                          {t.name} <span className="text-slate-500">— {t.cityName ?? t.cityId}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                type="button"
                onClick={handleAddByTown}
                disabled={!selectedTownId}
                className="rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                Add
              </button>
            </div>

            <h3 className="text-sm font-semibold text-slate-200">Towns</h3>

            {assignmentRows.length > 0 && (
              <>
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2">
                  <span className="text-xs font-medium text-slate-400">Filter table:</span>
                  <input
                    type="text"
                    value={filterTown}
                    onChange={(e) => setFilterTown(e.target.value)}
                    placeholder="Town…"
                    className="w-28 rounded-lg border border-slate-600 bg-slate-900 px-2 py-1.5 text-xs text-slate-100 placeholder:text-slate-500"
                    aria-label="Filter by town name"
                  />
                  <input
                    type="text"
                    value={filterCity}
                    onChange={(e) => setFilterCity(e.target.value)}
                    placeholder="City…"
                    className="w-28 rounded-lg border border-slate-600 bg-slate-900 px-2 py-1.5 text-xs text-slate-100 placeholder:text-slate-500"
                    aria-label="Filter by city name"
                  />
                  <select
                    value={filterAgentId}
                    onChange={(e) => setFilterAgentId(e.target.value)}
                    className="min-w-[100px] rounded-lg border border-slate-600 bg-slate-900 px-2 py-1.5 text-xs text-slate-100"
                    aria-label="Filter by agent"
                  >
                    <option value="">All agents</option>
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.displayName}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filterDriverId}
                    onChange={(e) => setFilterDriverId(e.target.value)}
                    className="min-w-[100px] rounded-lg border border-slate-600 bg-slate-900 px-2 py-1.5 text-xs text-slate-100"
                    aria-label="Filter by driver"
                  >
                    <option value="">All drivers</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.displayName}
                      </option>
                    ))}
                  </select>
                  {(filterTown || filterCity || filterAgentId || filterDriverId) && (
                    <button
                      type="button"
                      onClick={() => {
                        setFilterTown('');
                        setFilterCity('');
                        setFilterAgentId('');
                        setFilterDriverId('');
                      }}
                      className="rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                    >
                      Clear filters
                    </button>
                  )}
                  <span className="ml-1 text-xs text-slate-500">
                    {assignmentFilteredRows.length === assignmentRows.length
                      ? `${assignmentRows.length} town(s)`
                      : `${assignmentFilteredRows.length} of ${assignmentRows.length} town(s)`}
                  </span>
                </div>
              </>
            )}

            {(agents.length === 0 || drivers.length === 0) && (
              <p className="rounded-xl border border-amber-600/50 bg-amber-900/20 px-3 py-2 text-xs text-amber-200">
                {agents.length === 0 && drivers.length === 0
                  ? 'No agents or drivers loaded. Create users with role Agent or Driver in User Management, then refresh this page.'
                  : agents.length === 0
                    ? 'No agents loaded. Create users with role Agent in User Management, then refresh.'
                    : 'No drivers loaded. Create users with role Driver in User Management, then refresh.'}
              </p>
            )}

            {assignmentRows.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-left text-slate-400">
                      <th className="pb-2 pr-4">Town</th>
                      <th className="pb-2 pr-4">Agent</th>
                      <th className="pb-2 pr-4">Driver</th>
                      <th className="pb-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignmentFilteredRows.map((row) => (
                      <tr key={row.townId} className="border-b border-slate-800">
                        <td className="py-2 pr-4 font-medium text-slate-200">
                          {row.townName} <span className="text-slate-500">({row.cityName})</span>
                        </td>
                        <td className="py-2 pr-4">
                          <select
                            value={row.agentId}
                            onChange={(e) => updateAssignmentRow(row.townId, { agentId: e.target.value })}
                            className="w-full min-w-[120px] rounded-lg border border-slate-600 bg-slate-900 px-2 py-1.5 text-slate-100"
                          >
                            <option value="">Select Agent</option>
                            {agents.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.displayName}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 pr-4">
                          <select
                            value={row.driverId}
                            onChange={(e) => updateAssignmentRow(row.townId, { driverId: e.target.value })}
                            className="w-full min-w-[120px] rounded-lg border border-slate-600 bg-slate-900 px-2 py-1.5 text-slate-100"
                          >
                            <option value="">Select Driver</option>
                            {drivers.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.displayName}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleAssignRemoveClick(row)}
                              className="rounded p-1 text-red-400 hover:bg-red-900/40 hover:text-red-300"
                              title="Remove town"
                              aria-label="Remove"
                            >
                              ✕
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAssignSave(row)}
                              disabled={
                                !row.agentId ||
                                !row.driverId ||
                                assignSaving === row.townId
                              }
                              className="rounded-xl border border-emerald-600 bg-emerald-900/40 px-3 py-1.5 text-xs font-medium text-emerald-200 hover:bg-emerald-800/50 disabled:opacity-50"
                            >
                              {assignSaving === row.townId ? 'Saving…' : 'Save Changes'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Remove town confirmation modal */}
            {removeAssignRow && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
                onClick={() => setRemoveAssignRow(null)}
              >
                <div
                  className="w-full max-w-sm rounded-2xl border border-slate-600 bg-slate-900 p-5 shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-sm text-slate-200">
                    Do you want to remove this town from assignments?
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-100">
                    {removeAssignRow.townName} <span className="text-slate-500">({removeAssignRow.cityName})</span>
                  </p>
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setRemoveAssignRow(null)}
                      className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAssignRemoveConfirm}
                      className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        </section>
      </div>

      {/* Provinces modal */}
      {showProvinceModal && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-3 py-6 md:p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget && !provinceSaving) closeProvinceModal();
          }}
        >
          <div className="flex max-h-full w-full max-w-xl flex-col rounded-3xl border border-slate-700 bg-slate-900 p-5 shadow-xl md:p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-100">Manage Provinces</h2>
              <button
                type="button"
                onClick={closeProvinceModal}
                disabled={provinceSaving}
                aria-label="Close"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-60"
              >
                ✕
              </button>
            </div>
            {provinceModalError && (
              <div className="mb-4 flex items-start justify-between gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                <span className="flex-1 whitespace-pre-line">{provinceModalError}</span>
                <button
                  type="button"
                  onClick={() => setProvinceModalError('')}
                  aria-label="Dismiss"
                  className="shrink-0 rounded p-1 hover:bg-red-500/20"
                >
                  ✕
                </button>
              </div>
            )}
            <div className="flex-1 space-y-5 overflow-hidden">
              <form onSubmit={handleProvinceSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    {provinceMode === 'edit' ? 'Edit Province Name' : 'Add New Province'}
                  </label>
                  <input
                    value={provinceName}
                    onChange={(e) => setProvinceName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-emerald-500"
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeProvinceModal}
                    disabled={provinceSaving}
                    className="rounded-2xl border border-slate-600 px-4 py-2 text-xs text-slate-100 hover:bg-slate-800 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={provinceSaving}
                    className="rounded-2xl bg-emerald-500 px-5 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
                  >
                    {provinceSaving ? 'Saving...' : provinceMode === 'edit' ? 'Save Changes' : 'Add Province'}
                  </button>
                </div>
              </form>
              <div className="shrink-0">
                <label className="mb-2 block text-sm font-medium text-slate-200">Filter provinces</label>
                <input
                  type="text"
                  value={provinceModalFilter}
                  onChange={(e) => setProvinceModalFilter(e.target.value)}
                  placeholder="Type province name…"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-emerald-500 placeholder:text-slate-500"
                  aria-label="Filter province list"
                />
              </div>
              <div className="max-h-64 space-y-2 overflow-y-auto pt-2 md:max-h-80">
                {loading && (
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3 text-xs text-slate-400">
                    Loading provinces...
                  </div>
                )}
                {!loading && regions.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-3 text-xs text-slate-400">
                    No provinces yet. Use the form above to add one.
                  </div>
                )}
                {!loading && regions.length > 0 && regionsFilteredInModal.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-3 text-xs text-slate-400">
                    No provinces match the filter.
                  </div>
                )}
                {!loading &&
                  regionsFilteredInModal.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 px-3 py-2"
                    >
                      <div className="text-xs font-semibold text-slate-100">
                        {r.name}{' '}
                        <span className="text-[10px] font-normal text-emerald-400">
                          {r.status ? '(Enabled)' : '(Disabled)'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleProvinceStatus(r)}
                          className="rounded-2xl border border-slate-600 px-2 py-1 text-[10px] text-slate-100 hover:bg-slate-800"
                        >
                          {r.status ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          type="button"
                          onClick={() => openProvinceEdit(r)}
                          className="rounded-2xl border border-slate-600 px-2 py-1 text-[10px] text-slate-100 hover:bg-slate-800"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProvinceClick(r)}
                          className="rounded-2xl border border-red-500/70 px-2 py-1 text-[10px] text-red-400 hover:bg-red-500/10"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete province confirmation */}
      {deleteProvinceConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setDeleteProvinceConfirm(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-slate-600 bg-slate-900 p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm text-slate-200">Do you want to delete this province?</p>
            <p className="mt-2 text-sm font-medium text-slate-100">({deleteProvinceConfirm.name})</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteProvinceConfirm(null)}
                className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProvinceConfirm}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Districts modal */}
      {showDistrictModal && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-3 py-6 md:p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget && !districtSaving) closeDistrictModal();
          }}
        >
          <div className="flex max-h-full w-full max-w-xl flex-col rounded-3xl border border-slate-700 bg-slate-900 p-5 shadow-xl md:p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-100">Manage Districts</h2>
              <button
                type="button"
                onClick={closeDistrictModal}
                disabled={districtSaving}
                aria-label="Close manage districts"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-60"
              >
                ✕
              </button>
            </div>
            {districtModalError && (
              <div className="mb-4 flex items-start justify-between gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                <span className="flex-1 whitespace-pre-line">{districtModalError}</span>
                <button
                  type="button"
                  onClick={() => setDistrictModalError('')}
                  aria-label="Dismiss"
                  className="shrink-0 rounded p-1 hover:bg-red-500/20"
                >
                  ✕
                </button>
              </div>
            )}
            <div className="flex-1 space-y-5 overflow-hidden">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  View / add districts for province
                </label>
                <select
                  value={districtRegionId || ''}
                  onChange={(e) => {
                    const id = e.target.value;
                    setDistrictRegionId(id);
                  }}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-emerald-500"
                  aria-label="View / add districts for province"
                >
                  <option value="">Select province</option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <form onSubmit={handleDistrictSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    {districtMode === 'edit' ? 'Edit District Name' : 'Add New District'}
                  </label>
                  <input
                    value={districtName}
                    onChange={(e) => setDistrictName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-emerald-500"
                    placeholder={districtRegionId ? undefined : 'Select a province first'}
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeDistrictModal}
                    disabled={districtSaving}
                    className="rounded-2xl border border-slate-600 px-4 py-2 text-xs text-slate-100 hover:bg-slate-800 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={districtSaving || !districtRegionId}
                    className="rounded-2xl bg-emerald-500 px-5 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
                  >
                    {districtSaving
                      ? 'Saving...'
                      : districtMode === 'edit'
                      ? 'Save Changes'
                      : 'Add District'}
                  </button>
                </div>
              </form>

              <div className="shrink-0">
                <label className="mb-2 block text-sm font-medium text-slate-200">Filter districts</label>
                <input
                  type="text"
                  value={districtModalFilter}
                  onChange={(e) => setDistrictModalFilter(e.target.value)}
                  placeholder="Type district or province name…"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-emerald-500 placeholder:text-slate-500"
                  aria-label="Filter district list"
                />
              </div>

              <div className="max-h-64 space-y-2 overflow-y-auto pt-2 md:max-h-80">
                {loading && (
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3 text-xs text-slate-400">
                    Loading districts...
                  </div>
                )}
                {!loading && (
                  <div key={districtRegionId || 'all'} className="space-y-2">
                    <p className="text-xs font-medium text-slate-400">
                      {districtRegionId ? (
                        <>
                          Added districts for{' '}
                          <span className="text-slate-200">
                            {regions.find((r) => r.id === districtRegionId)?.name ?? 'this province'}
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-200">All added districts</span>
                      )}
                      {' '}
                      <span className="text-slate-500">
                        ({districtsFilteredInModal.length}{districtFilterQ ? ` of ${districtsToShowInModal.length}` : ''})
                      </span>
                    </p>
                    {districtsToShowInModal.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-3 text-xs text-slate-400">
                        {districtRegionId
                          ? 'No districts for this province yet. Add one using the form above.'
                          : 'No districts yet. Select a province and add one above.'}
                      </div>
                    ) : districtsFilteredInModal.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-3 text-xs text-slate-400">
                        No districts match the filter.
                      </div>
                    ) : (
                      <div className="min-h-[6rem] space-y-2">
                        {districtsFilteredInModal.map((d) => (
                          <div
                            key={d.id}
                            className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 px-3 py-2"
                          >
                            <div>
                              <div className="text-xs font-semibold text-slate-100">
                                {d.name}{' '}
                                <span className="text-[10px] font-normal text-slate-400">
                                  {d.regionName ? `(${d.regionName})` : ''}
                                </span>
                              </div>
                              <div className="text-[10px] text-emerald-400">
                                {d.status ? 'Enabled' : 'Disabled'}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleToggleDistrictStatus(d)}
                                className="rounded-2xl border border-slate-600 px-2 py-1 text-[10px] text-slate-100 hover:bg-slate-800"
                              >
                                {d.status ? 'Disable' : 'Enable'}
                              </button>
                              <button
                                type="button"
                                onClick={() => openDistrictEdit(d)}
                                className="rounded-2xl border border-slate-600 px-2 py-1 text-[10px] text-slate-100 hover:bg-slate-800"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteDistrictClick(d)}
                                className="rounded-2xl border border-red-500/70 px-2 py-1 text-[10px] text-red-400 hover:bg-red-500/10"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete district confirmation */}
      {deleteDistrictConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setDeleteDistrictConfirm(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-slate-600 bg-slate-900 p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm text-slate-200">Do you want to delete this district?</p>
            <p className="mt-2 text-sm font-medium text-slate-100">({deleteDistrictConfirm.name})</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteDistrictConfirm(null)}
                className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteDistrictConfirm}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cities modal */}
      {showCityModal && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-3 py-6 md:p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget && !citySaving) {
              closeCityModal();
            }
          }}
        >
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl border border-slate-700 bg-slate-900 p-5 shadow-xl md:p-6">
            <div className="mb-4 flex shrink-0 items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-100">Manage Cities</h2>
              <button
                type="button"
                onClick={closeCityModal}
                disabled={citySaving}
                aria-label="Close manage cities"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-60"
              >
                ✕
              </button>
            </div>
            {cityModalError && (
              <div className="mb-4 flex items-start justify-between gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                <span className="flex-1 whitespace-pre-line">{cityModalError}</span>
                <button
                  type="button"
                  onClick={() => setCityModalError('')}
                  aria-label="Dismiss"
                  className="shrink-0 rounded p-1 hover:bg-red-500/20"
                >
                  ✕
                </button>
              </div>
            )}
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
              <div className="shrink-0">
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  View / add cities for province
                </label>
                <select
                  value={cityRegionId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setCityRegionId(id);
                    const first = districts.find((d) => d.regionId === id);
                    setCityDistrictId(first?.id ?? '');
                  }}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-emerald-500"
                >
                  <option value="">Select province</option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="shrink-0">
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  District
                </label>
                <select
                  value={cityDistrictId}
                  onChange={(e) => setCityDistrictId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-emerald-500"
                >
                  <option value="">Select district</option>
                  {districtsForCityProvince.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <form onSubmit={handleCitySubmit} className="shrink-0 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    {cityMode === 'edit' ? 'Edit City Name' : 'Add New City'}
                  </label>
                  <input
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-emerald-500"
                    placeholder={cityDistrictId ? undefined : 'Select a district first'}
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeCityModal}
                    disabled={citySaving}
                    className="rounded-2xl border border-slate-600 px-4 py-2 text-xs text-slate-100 hover:bg-slate-800 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={citySaving || !cityDistrictId}
                    className="rounded-2xl bg-emerald-500 px-5 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
                  >
                    {citySaving
                      ? 'Saving...'
                      : cityMode === 'edit'
                      ? 'Save Changes'
                      : 'Add City'}
                  </button>
                </div>
              </form>

              <div className="shrink-0">
                <label className="mb-2 block text-sm font-medium text-slate-200">Filter cities</label>
                <input
                  type="text"
                  value={cityModalFilter}
                  onChange={(e) => setCityModalFilter(e.target.value)}
                  placeholder="Type city, district or province name…"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-emerald-500 placeholder:text-slate-500"
                  aria-label="Filter city list"
                />
              </div>

              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto rounded-2xl border border-slate-800/50 bg-slate-950/30 pt-2 md:min-h-[12rem]">
                {loading && (
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3 text-xs text-slate-400">
                    Loading cities...
                  </div>
                )}

                {!loading && (
                  <div key={cityDistrictId || 'all'} className="space-y-2">
                    <p className="text-xs font-medium text-slate-400">
                      {cityDistrictId ? (
                        <>
                          Cities in{' '}
                          <span className="text-slate-200">
                            {districts.find((d) => d.id === cityDistrictId)?.name ?? 'this district'}
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-200">All added cities</span>
                      )}
                      {' '}
                      <span className="text-slate-500">
                        ({citiesFilteredInModal.length}{cityFilterQ ? ` of ${citiesToShowInModal.length}` : ''})
                      </span>
                    </p>
                    {citiesToShowInModal.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-3 text-xs text-slate-400">
                        {cityDistrictId
                          ? 'No cities in this district yet. Add one using the form above.'
                          : 'No cities yet. Select a district and add one above.'}
                      </div>
                    ) : citiesFilteredInModal.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-3 text-xs text-slate-400">
                        No cities match the filter.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {citiesFilteredInModal.map((city) => (
                          <div
                            key={city.id}
                            className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 px-3 py-2"
                          >
                            <div>
                              <div className="text-xs font-semibold text-slate-100">
                                {city.name}{' '}
                                <span className="text-[10px] font-normal text-slate-400">
                                  {city.districtName ? `(${city.districtName})` : city.regionName ? `(${city.regionName})` : ''}
                                </span>
                              </div>
                              <div className="text-[10px] text-emerald-400">
                                {city.status ? 'Enabled' : 'Disabled'}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleToggleCityStatus(city)}
                                className="rounded-2xl border border-slate-600 px-2 py-1 text-[10px] text-slate-100 hover:bg-slate-800"
                              >
                                {city.status ? 'Disable' : 'Enable'}
                              </button>
                              <button
                                type="button"
                                onClick={() => openCityEdit(city)}
                                className="rounded-2xl border border-slate-600 px-2 py-1 text-[10px] text-slate-100 hover:bg-slate-800"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCityClick(city)}
                                className="rounded-2xl border border-red-500/70 px-2 py-1 text-[10px] text-red-400 hover:bg-red-500/10"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete city confirmation */}
      {deleteCityConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setDeleteCityConfirm(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-slate-600 bg-slate-900 p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm text-slate-200">Do you want to delete this city?</p>
            <p className="mt-2 text-sm font-medium text-slate-100">({deleteCityConfirm.name})</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteCityConfirm(null)}
                className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCityConfirm}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Towns modal */}
      {showTownModal && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-3 py-6 md:p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget && !townSaving) closeTownModal();
          }}
        >
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl border border-slate-700 bg-slate-900 p-5 shadow-xl md:p-6">
            <div className="mb-4 flex shrink-0 items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-100">Manage Towns</h2>
              <button
                type="button"
                onClick={closeTownModal}
                disabled={townSaving}
                aria-label="Close manage towns"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-60"
              >
                ✕
              </button>
            </div>
            {townModalError && (
              <div className="mb-4 flex items-start justify-between gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                <span className="flex-1 whitespace-pre-line">{townModalError}</span>
                <button
                  type="button"
                  onClick={() => setTownModalError('')}
                  aria-label="Dismiss"
                  className="shrink-0 rounded p-1 hover:bg-red-500/20"
                >
                  ✕
                </button>
              </div>
            )}
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
              <div className="shrink-0">
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  View / add towns for city
                </label>
                <select
                  value={townRegionId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setTownRegionId(id);
                    setTownDistrictId('');
                    setTownCityId('');
                  }}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-emerald-500"
                >
                  <option value="">Select province</option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="shrink-0">
                <label className="mb-2 block text-sm font-medium text-slate-200">District</label>
                <select
                  value={townDistrictId}
                  onChange={(e) => {
                    setTownDistrictId(e.target.value);
                    setTownCityId('');
                  }}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-emerald-500"
                >
                  <option value="">Select district</option>
                  {districtsForTownProvince.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="shrink-0">
                <label className="mb-2 block text-sm font-medium text-slate-200">City</label>
                <select
                  value={townCityId}
                  onChange={(e) => setTownCityId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-emerald-500"
                >
                  <option value="">Select city</option>
                  {citiesForTownDistrict.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <form onSubmit={handleTownSubmit} className="shrink-0 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    {townMode === 'edit' ? 'Edit Town Name' : 'Add New Town'}
                  </label>
                  <input
                    value={townName}
                    onChange={(e) => setTownName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-emerald-500"
                    placeholder={townCityId ? undefined : 'Select a city first'}
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeTownModal}
                    disabled={townSaving}
                    className="rounded-2xl border border-slate-600 px-4 py-2 text-xs text-slate-100 hover:bg-slate-800 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={townSaving || !townCityId}
                    className="rounded-2xl bg-emerald-500 px-5 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
                  >
                    {townSaving
                      ? 'Saving...'
                      : townMode === 'edit'
                        ? 'Save Changes'
                        : 'Add Town'}
                  </button>
                </div>
              </form>

              <div className="shrink-0">
                <label className="mb-2 block text-sm font-medium text-slate-200">Filter towns</label>
                <input
                  type="text"
                  value={townModalFilter}
                  onChange={(e) => setTownModalFilter(e.target.value)}
                  placeholder="Type town or city name…"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-emerald-500 placeholder:text-slate-500"
                  aria-label="Filter town list"
                />
              </div>

              <div className="flex min-h-[10rem] max-h-[42vh] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-800/50 bg-slate-950/30">
                <p className="shrink-0 pt-2 text-xs font-medium text-slate-400">
                  {townCityId ? (
                    <>
                      Towns in{' '}
                      <span className="text-slate-200">
                        {cities.find((c) => c.id === townCityId)?.name ?? 'this city'}
                      </span>
                      {' '}
                      <span className="text-slate-500">({townsFilteredInModal.length}{townListFilterQuery ? ` of ${townsToShowInModal.length}` : ''})</span>
                    </>
                  ) : townDistrictId ? (
                    <>
                      Towns in{' '}
                      <span className="text-slate-200">
                        {districts.find((d) => d.id === townDistrictId)?.name ?? 'this district'}
                      </span>
                      {' '}
                      <span className="text-slate-500">({townsFilteredInModal.length}{townListFilterQuery ? ` of ${townsToShowInModal.length}` : ''})</span>
                    </>
                  ) : townRegionId ? (
                    <>
                      Towns in{' '}
                      <span className="text-slate-200">
                        {regions.find((r) => r.id === townRegionId)?.name ?? 'this province'}
                      </span>
                      {' '}
                      <span className="text-slate-500">({townsFilteredInModal.length}{townListFilterQuery ? ` of ${townsToShowInModal.length}` : ''})</span>
                    </>
                  ) : (
                    <>
                      <span className="text-slate-200">All added towns</span>
                      {' '}
                      <span className="text-slate-500">({townsFilteredInModal.length}{townListFilterQuery ? ` of ${townsToShowInModal.length}` : ''})</span>
                    </>
                  )}
                </p>
                <div className="min-h-0 flex-1 overflow-y-auto pt-2 pb-4">
                  {townsToShowInModal.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-3 text-xs text-slate-400">
                      {townCityId
                        ? 'No towns in this city yet. Add one using the form above.'
                        : townRegionId || townDistrictId
                          ? 'No towns in this area yet. Select a city and add one above.'
                          : 'No towns yet. Select a city and add one above.'}
                    </div>
                  ) : townsFilteredInModal.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-3 text-xs text-slate-400">
                      No towns match the filter. Try a different search.
                    </div>
                  ) : (
                    <div className="space-y-2 pr-1 pb-2">
                      {townsFilteredInModal.map((town) => (
                      <div
                        key={town.id}
                        className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 px-3 py-2"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-100">
                            {town.name}{' '}
                            <span className="text-[10px] font-normal text-slate-400">
                              {town.cityName ? `(${town.cityName})` : ''}
                            </span>
                          </div>
                          <div className="text-[10px] text-emerald-400">
                            {town.status ? 'Enabled' : 'Disabled'}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleTownStatus(town)}
                            className="rounded-2xl border border-slate-600 px-2 py-1 text-[10px] text-slate-100 hover:bg-slate-800"
                          >
                            {town.status ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            type="button"
                            onClick={() => openTownEdit(town)}
                            className="rounded-2xl border border-slate-600 px-2 py-1 text-[10px] text-slate-100 hover:bg-slate-800"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTownClick(town)}
                            className="rounded-2xl border border-red-500/70 px-2 py-1 text-[10px] text-red-400 hover:bg-red-500/10"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Delete town confirmation */}
      {deleteTownConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setDeleteTownConfirm(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-slate-600 bg-slate-900 p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm text-slate-200">Do you want to delete this town?</p>
            <p className="mt-2 text-sm font-medium text-slate-100">({deleteTownConfirm.name})</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTownConfirm(null)}
                className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteTownConfirm}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import and Export Data modal */}
      {showImportExportModal && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-3 py-6 md:p-6"
          onClick={() => setShowImportExportModal(false)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-3xl border border-slate-700 bg-slate-900 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-700 p-4">
              <h2 className="text-lg font-semibold text-slate-100">Import and Export Data</h2>
              <button
                type="button"
                onClick={() => setShowImportExportModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
              {/* Export */}
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Export</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={csvExportType}
                    onChange={(e) => setCsvExportType(e.target.value as typeof csvExportType)}
                    className="rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-xs text-slate-200"
                    aria-label="Export type"
                  >
                    <option value="all">Export all</option>
                    <option value="provinces">Provinces</option>
                    <option value="districts">Districts</option>
                    <option value="cities">Cities</option>
                    <option value="towns">Towns</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="rounded-xl border border-emerald-600 bg-emerald-900/50 px-3 py-2 text-xs font-medium text-emerald-200 hover:bg-emerald-800/60"
                  >
                    Export CSV
                  </button>
                </div>
              </section>
              {/* Import */}
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Import</h3>
                <p className="mb-2 text-[10px] text-slate-500">
                  Merge = skip duplicates: existing provinces, districts, cities or towns are not re-created.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={csvImportType}
                    onChange={(e) => setCsvImportType(e.target.value as typeof csvImportType)}
                    className="rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-xs text-slate-200"
                    aria-label="Import type"
                  >
                    <option value="provinces">Provinces</option>
                    <option value="districts">Districts</option>
                    <option value="cities">Cities</option>
                    <option value="towns">Towns</option>
                  </select>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleImportFileChange}
                  />
                  <button
                    type="button"
                    onClick={triggerImportFile}
                    disabled={csvImporting}
                    className="rounded-xl border border-sky-600 bg-sky-900/50 px-3 py-2 text-xs font-medium text-sky-200 hover:bg-sky-800/60 disabled:opacity-50"
                  >
                    {csvImporting ? 'Importing…' : 'Import CSV'}
                  </button>
                </div>
              </section>
              {/* Upload wizard result */}
              {importResult && (
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Result</h3>
                  <div
                    className={
                      importResult.type === 'error'
                        ? 'rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300'
                        : 'rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300'
                    }
                  >
                    {importResult.type === 'error' ? (
                      <>
                        <p className="font-medium">Upload failed or some rows were skipped</p>
                        <p className="mt-1 whitespace-pre-wrap">{importResult.message}</p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium">Successfully uploaded this data</p>
                        <p className="mt-1">{importResult.message}</p>
                      </>
                    )}
                  </div>
                </section>
              )}
            </div>
            <div className="border-t border-slate-700 p-4">
              <button
                type="button"
                onClick={() => setShowImportExportModal(false)}
                className="w-full rounded-2xl border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

