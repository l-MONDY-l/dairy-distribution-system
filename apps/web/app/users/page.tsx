'use client';

import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/layout/app-layout';
import {
  createUser,
  deleteUser,
  getRoles,
  getUsers,
  updateUser,
  updateUserStatus,
} from '@/lib/users-api';
import type {
  CreateUserPayload,
  Permission,
  Role,
  UpdateUserPayload,
  User,
  UserStatus,
} from '@/lib/types';
import {
  getPermissions,
  getRolePermissionIds,
  updateRolePermissions,
} from '@/lib/permissions-api';

const initialCreateForm: CreateUserPayload = {
  fullName: '',
  username: '',
  email: '',
  phone: '',
  password: '',
  roleCode: '',
};

const initialEditForm: UpdateUserPayload = {
  fullName: '',
  username: '',
  email: '',
  phone: '',
  roleCode: '',
  status: 'ACTIVE',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9]+$/;
/** Sri Lanka: +94 followed by 9 digits starting with 7 */
const PHONE_REGEX_LK = /^\+947\d{8}$/;

const COUNTRY_CODES = [
  { code: '+93', country: 'Afghanistan', flag: '🇦🇫' },
  { code: '+355', country: 'Albania', flag: '🇦🇱' },
  { code: '+213', country: 'Algeria', flag: '🇩🇿' },
  { code: '+376', country: 'Andorra', flag: '🇦🇩' },
  { code: '+244', country: 'Angola', flag: '🇦🇴' },
  { code: '+1-264', country: 'Anguilla', flag: '🇦🇮' },
  { code: '+672', country: 'Antarctica', flag: '🇦🇶' },
  { code: '+1-268', country: 'Antigua and Barbuda', flag: '🇦🇬' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+374', country: 'Armenia', flag: '🇦🇲' },
  { code: '+297', country: 'Aruba', flag: '🇦🇼' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+43', country: 'Austria', flag: '🇦🇹' },
  { code: '+994', country: 'Azerbaijan', flag: '🇦🇿' },
  { code: '+1-242', country: 'Bahamas', flag: '🇧🇸' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
  { code: '+1-246', country: 'Barbados', flag: '🇧🇧' },
  { code: '+375', country: 'Belarus', flag: '🇧🇾' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪' },
  { code: '+501', country: 'Belize', flag: '🇧🇿' },
  { code: '+229', country: 'Benin', flag: '🇧🇯' },
  { code: '+1-441', country: 'Bermuda', flag: '🇧🇲' },
  { code: '+975', country: 'Bhutan', flag: '🇧🇹' },
  { code: '+591', country: 'Bolivia', flag: '🇧🇴' },
  { code: '+387', country: 'Bosnia and Herzegovina', flag: '🇧🇦' },
  { code: '+267', country: 'Botswana', flag: '🇧🇼' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+673', country: 'Brunei', flag: '🇧🇳' },
  { code: '+359', country: 'Bulgaria', flag: '🇧🇬' },
  { code: '+226', country: 'Burkina Faso', flag: '🇧🇫' },
  { code: '+257', country: 'Burundi', flag: '🇧🇮' },
  { code: '+855', country: 'Cambodia', flag: '🇰🇭' },
  { code: '+237', country: 'Cameroon', flag: '🇨🇲' },
  { code: '+1', country: 'Canada / USA', flag: '🇨🇦' },
  { code: '+238', country: 'Cape Verde', flag: '🇨🇻' },
  { code: '+1-345', country: 'Cayman Islands', flag: '🇰🇾' },
  { code: '+236', country: 'Central African Republic', flag: '🇨🇫' },
  { code: '+235', country: 'Chad', flag: '🇹🇩' },
  { code: '+56', country: 'Chile', flag: '🇨🇱' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴' },
  { code: '+269', country: 'Comoros', flag: '🇰🇲' },
  { code: '+242', country: 'Congo', flag: '🇨🇬' },
  { code: '+243', country: 'Congo (DRC)', flag: '🇨🇩' },
  { code: '+682', country: 'Cook Islands', flag: '🇨🇰' },
  { code: '+506', country: 'Costa Rica', flag: '🇨🇷' },
  { code: '+385', country: 'Croatia', flag: '🇭🇷' },
  { code: '+53', country: 'Cuba', flag: '🇨🇺' },
  { code: '+357', country: 'Cyprus', flag: '🇨🇾' },
  { code: '+420', country: 'Czech Republic', flag: '🇨🇿' },
  { code: '+45', country: 'Denmark', flag: '🇩🇰' },
  { code: '+253', country: 'Djibouti', flag: '🇩🇯' },
  { code: '+1-767', country: 'Dominica', flag: '🇩🇲' },
  { code: '+1-809', country: 'Dominican Republic', flag: '🇩🇴' },
  { code: '+593', country: 'Ecuador', flag: '🇪🇨' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬' },
  { code: '+503', country: 'El Salvador', flag: '🇸🇻' },
  { code: '+240', country: 'Equatorial Guinea', flag: '🇬🇶' },
  { code: '+291', country: 'Eritrea', flag: '🇪🇷' },
  { code: '+372', country: 'Estonia', flag: '🇪🇪' },
  { code: '+251', country: 'Ethiopia', flag: '🇪🇹' },
  { code: '+679', country: 'Fiji', flag: '🇫🇯' },
  { code: '+358', country: 'Finland', flag: '🇫🇮' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+241', country: 'Gabon', flag: '🇬🇦' },
  { code: '+220', country: 'Gambia', flag: '🇬🇲' },
  { code: '+995', country: 'Georgia', flag: '🇬🇪' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+233', country: 'Ghana', flag: '🇬🇭' },
  { code: '+350', country: 'Gibraltar', flag: '🇬🇮' },
  { code: '+30', country: 'Greece', flag: '🇬🇷' },
  { code: '+299', country: 'Greenland', flag: '🇬🇱' },
  { code: '+1-473', country: 'Grenada', flag: '🇬🇩' },
  { code: '+502', country: 'Guatemala', flag: '🇬🇹' },
  { code: '+224', country: 'Guinea', flag: '🇬🇳' },
  { code: '+245', country: 'Guinea-Bissau', flag: '🇬🇼' },
  { code: '+592', country: 'Guyana', flag: '🇬🇾' },
  { code: '+509', country: 'Haiti', flag: '🇭🇹' },
  { code: '+504', country: 'Honduras', flag: '🇭🇳' },
  { code: '+852', country: 'Hong Kong', flag: '🇭🇰' },
  { code: '+36', country: 'Hungary', flag: '🇭🇺' },
  { code: '+354', country: 'Iceland', flag: '🇮🇸' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
  { code: '+98', country: 'Iran', flag: '🇮🇷' },
  { code: '+964', country: 'Iraq', flag: '🇮🇶' },
  { code: '+353', country: 'Ireland', flag: '🇮🇪' },
  { code: '+972', country: 'Israel', flag: '🇮🇱' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+1-876', country: 'Jamaica', flag: '🇯🇲' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+962', country: 'Jordan', flag: '🇯🇴' },
  { code: '+7', country: 'Kazakhstan', flag: '🇰🇿' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+686', country: 'Kiribati', flag: '🇰🇮' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
  { code: '+996', country: 'Kyrgyzstan', flag: '🇰🇬' },
  { code: '+856', country: 'Laos', flag: '🇱🇦' },
  { code: '+371', country: 'Latvia', flag: '🇱🇻' },
  { code: '+961', country: 'Lebanon', flag: '🇱🇧' },
  { code: '+266', country: 'Lesotho', flag: '🇱🇸' },
  { code: '+231', country: 'Liberia', flag: '🇱🇷' },
  { code: '+218', country: 'Libya', flag: '🇱🇾' },
  { code: '+423', country: 'Liechtenstein', flag: '🇱🇮' },
  { code: '+370', country: 'Lithuania', flag: '🇱🇹' },
  { code: '+352', country: 'Luxembourg', flag: '🇱🇺' },
  { code: '+853', country: 'Macau', flag: '🇲🇴' },
  { code: '+389', country: 'North Macedonia', flag: '🇲🇰' },
  { code: '+261', country: 'Madagascar', flag: '🇲🇬' },
  { code: '+265', country: 'Malawi', flag: '🇲🇼' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+960', country: 'Maldives', flag: '🇲🇻' },
  { code: '+223', country: 'Mali', flag: '🇲🇱' },
  { code: '+356', country: 'Malta', flag: '🇲🇹' },
  { code: '+692', country: 'Marshall Islands', flag: '🇲🇭' },
  { code: '+596', country: 'Martinique', flag: '🇲🇫' },
  { code: '+222', country: 'Mauritania', flag: '🇲🇷' },
  { code: '+230', country: 'Mauritius', flag: '🇲🇺' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽' },
  { code: '+691', country: 'Micronesia', flag: '🇫🇲' },
  { code: '+373', country: 'Moldova', flag: '🇲🇩' },
  { code: '+377', country: 'Monaco', flag: '🇲🇨' },
  { code: '+976', country: 'Mongolia', flag: '🇲🇳' },
  { code: '+382', country: 'Montenegro', flag: '🇲🇪' },
  { code: '+212', country: 'Morocco', flag: '🇲🇦' },
  { code: '+258', country: 'Mozambique', flag: '🇲🇿' },
  { code: '+95', country: 'Myanmar (Burma)', flag: '🇲🇲' },
  { code: '+264', country: 'Namibia', flag: '🇳🇦' },
  { code: '+674', country: 'Nauru', flag: '🇳🇷' },
  { code: '+977', country: 'Nepal', flag: '🇳🇵' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
  { code: '+505', country: 'Nicaragua', flag: '🇳🇮' },
  { code: '+227', country: 'Niger', flag: '🇳🇪' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+850', country: 'North Korea', flag: '🇰🇵' },
  { code: '+47', country: 'Norway', flag: '🇳🇴' },
  { code: '+968', country: 'Oman', flag: '🇴🇲' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
  { code: '+680', country: 'Palau', flag: '🇵🇼' },
  { code: '+970', country: 'Palestine', flag: '🇵🇸' },
  { code: '+507', country: 'Panama', flag: '🇵🇦' },
  { code: '+675', country: 'Papua New Guinea', flag: '🇵🇬' },
  { code: '+595', country: 'Paraguay', flag: '🇵🇾' },
  { code: '+51', country: 'Peru', flag: '🇵🇪' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭' },
  { code: '+48', country: 'Poland', flag: '🇵🇱' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦' },
  { code: '+40', country: 'Romania', flag: '🇷🇴' },
  { code: '+7', country: 'Russia', flag: '🇷🇺' },
  { code: '+250', country: 'Rwanda', flag: '🇷🇼' },
  { code: '+685', country: 'Samoa', flag: '🇼🇸' },
  { code: '+378', country: 'San Marino', flag: '🇸🇲' },
  { code: '+239', country: 'Sao Tome and Principe', flag: '🇸🇹' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+221', country: 'Senegal', flag: '🇸🇳' },
  { code: '+381', country: 'Serbia', flag: '🇷🇸' },
  { code: '+248', country: 'Seychelles', flag: '🇸🇨' },
  { code: '+232', country: 'Sierra Leone', flag: '🇸🇱' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+421', country: 'Slovakia', flag: '🇸🇰' },
  { code: '+386', country: 'Slovenia', flag: '🇸🇮' },
  { code: '+677', country: 'Solomon Islands', flag: '🇸🇧' },
  { code: '+252', country: 'Somalia', flag: '🇸🇴' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
  { code: '+211', country: 'South Sudan', flag: '🇸🇸' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
  { code: '+249', country: 'Sudan', flag: '🇸🇩' },
  { code: '+597', country: 'Suriname', flag: '🇸🇷' },
  { code: '+268', country: 'Eswatini', flag: '🇸🇿' },
  { code: '+46', country: 'Sweden', flag: '🇸🇪' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
  { code: '+963', country: 'Syria', flag: '🇸🇾' },
  { code: '+886', country: 'Taiwan', flag: '🇹🇼' },
  { code: '+992', country: 'Tajikistan', flag: '🇹🇯' },
  { code: '+255', country: 'Tanzania', flag: '🇹🇿' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭' },
  { code: '+228', country: 'Togo', flag: '🇹🇬' },
  { code: '+676', country: 'Tonga', flag: '🇹🇴' },
  { code: '+1-868', country: 'Trinidad and Tobago', flag: '🇹🇹' },
  { code: '+216', country: 'Tunisia', flag: '🇹🇳' },
  { code: '+90', country: 'Turkey', flag: '🇹🇷' },
  { code: '+993', country: 'Turkmenistan', flag: '🇹🇲' },
  { code: '+256', country: 'Uganda', flag: '🇺🇬' },
  { code: '+380', country: 'Ukraine', flag: '🇺🇦' },
  { code: '+971', country: 'United Arab Emirates', flag: '🇦🇪' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+1', country: 'United States / Canada', flag: '🇺🇸' },
  { code: '+598', country: 'Uruguay', flag: '🇺🇾' },
  { code: '+998', country: 'Uzbekistan', flag: '🇺🇿' },
  { code: '+678', country: 'Vanuatu', flag: '🇻🇺' },
  { code: '+58', country: 'Venezuela', flag: '🇻🇪' },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
  { code: '+967', country: 'Yemen', flag: '🇾🇪' },
  { code: '+260', country: 'Zambia', flag: '🇿🇲' },
  { code: '+263', country: 'Zimbabwe', flag: '🇿🇼' },
] as const;

function validatePhoneForCountry(code: string, number: string): string | undefined {
  const digits = number.replace(/\D/g, '');
  if (!digits) return 'Phone is required.';
  if (code === '+94') {
    if (digits.length !== 9) return 'Enter 9 digits for Sri Lanka.';
    if (digits[0] !== '7') return 'Sri Lanka mobile must start with 7 (e.g. 712345678).';
    return undefined;
  }
  if (digits.length < 8 || digits.length > 15) return 'Enter 8–15 digits.';
  return undefined;
}

function validateCreateForm(form: CreateUserPayload, lastName = ''): Record<string, string> {
  const err: Record<string, string> = {};
  const combinedName = `${(form.fullName?.trim() ?? '')} ${(lastName ?? '').trim()}`.trim() || (form.fullName?.trim() ?? '');
  if (!combinedName) err.fullName = 'First name is required.';
  else if (combinedName.length < 2) err.fullName = 'Name must be at least 2 characters.';
  else if (combinedName.length > 100) err.fullName = 'Full name must be at most 100 characters.';
  else if (!/^[A-Za-z\s]+$/.test(combinedName))
    err.fullName = 'Name can contain only letters and spaces.';

  const username = form.username?.trim() ?? '';
  if (!username) err.username = 'Username is required.';
  else if (username.length < 3) err.username = 'Username must be at least 3 characters.';
  else if (username.length > 50) err.username = 'Username must be at most 50 characters.';
  else if (!USERNAME_REGEX.test(username))
    err.username = 'Username can only contain letters and numbers (no spaces).';

  const email = form.email?.trim() ?? '';
  if (!email) err.email = 'Email is required.';
  else if (!EMAIL_REGEX.test(email))
    err.email = 'Invalid email, please type correct email address.';

  const phone = form.phone?.trim() ?? '';
  const matchedCountry = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length).find((c) => phone.startsWith(c.code));
  const phoneCode = matchedCountry?.code ?? '+94';
  const phoneNumber = matchedCountry ? phone.slice(matchedCountry.code.length) : phone;
  const phoneErr = validatePhoneForCountry(phoneCode, phoneNumber);
  if (phoneErr) err.phone = phoneErr;

  const password = form.password ?? '';
  if (!password) err.password = 'Password is required.';
  else if (password.length < 6) err.password = 'Password must be at least 6 characters.';
  else if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[^A-Za-z0-9]/.test(password))
    err.password = 'Password must include uppercase, lowercase and a special character.';

  if (!form.roleCode) err.roleCode = 'Please select a role.';
  return err;
}

function validateEditForm(form: UpdateUserPayload, lastName = ''): Record<string, string> {
  const err: Record<string, string> = {};
  const combinedName = `${(form.fullName?.trim() ?? '')} ${(lastName ?? '').trim()}`.trim() || (form.fullName?.trim() ?? '');
  if (!combinedName) err.fullName = 'First name is required.';
  else if (combinedName.length < 2) err.fullName = 'Name must be at least 2 characters.';
  else if (combinedName.length > 100) err.fullName = 'Full name must be at most 100 characters.';
  else if (!/^[A-Za-z\s]+$/.test(combinedName))
    err.fullName = 'Name can contain only letters and spaces.';

  const username = (form.username ?? '').trim();
  if (username.length > 0) {
    if (username.length < 3) err.username = 'Username must be at least 3 characters.';
    else if (username.length > 50) err.username = 'Username must be at most 50 characters.';
    else if (!USERNAME_REGEX.test(username))
      err.username = 'Username can only contain letters and numbers (no spaces).';
  }

  const email = form.email?.trim() ?? '';
  if (!email) err.email = 'Email is required.';
  else if (!EMAIL_REGEX.test(email))
    err.email = 'Invalid email, please type correct email address.';

  const phone = (form.phone ?? '').trim();
  if (phone) {
    const matchedCountry = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length).find((c) => phone.startsWith(c.code));
    const phoneCode = matchedCountry?.code ?? '+94';
    const phoneNumber = matchedCountry ? phone.slice(matchedCountry.code.length) : phone;
    const phoneErr = validatePhoneForCountry(phoneCode, phoneNumber);
    if (phoneErr) err.phone = phoneErr;
  }

  if (!form.roleCode) err.roleCode = 'Please select a role.';
  return err;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSave, setEditingSave] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createForm, setCreateForm] =
    useState<CreateUserPayload>(initialCreateForm);
  const [createFormLastName, setCreateFormLastName] = useState('');

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<UpdateUserPayload>(initialEditForm);
  const [editFormLastName, setEditFormLastName] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [adminRoleId, setAdminRoleId] = useState<string | null>(null);
  const [agentRoleId, setAgentRoleId] = useState<string | null>(null);
  const [driverRoleId, setDriverRoleId] = useState<string | null>(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [createFieldErrors, setCreateFieldErrors] = useState<Record<string, string>>({});
  const [editFieldErrors, setEditFieldErrors] = useState<Record<string, string>>({});
  const [createPhoneCountryCode, setCreatePhoneCountryCode] = useState('+94');
  const [editPhoneCountryCode, setEditPhoneCountryCode] = useState('+94');
  const [createPhoneDropdownOpen, setCreatePhoneDropdownOpen] = useState(false);
  const [editPhoneDropdownOpen, setEditPhoneDropdownOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createCountrySearch, setCreateCountrySearch] = useState('');
  const [editCountrySearch, setEditCountrySearch] = useState('');
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [statusToggleUser, setStatusToggleUser] = useState<User | null>(null);
  const [statusToggleLoading, setStatusToggleLoading] = useState(false);
  const [editConfirmPassword, setEditConfirmPassword] = useState('');

  const sortedCountryCodes = useMemo(
    () => [...COUNTRY_CODES].sort((a, b) => a.country.localeCompare(b.country)),
    [],
  );

  const normalizeCountry = (value: string) =>
    value.toLowerCase().replace(/\s+/g, '');

  const filteredCreateCountries = useMemo(() => {
    const raw = createCountrySearch.trim();
    const term = normalizeCountry(raw);
    if (!term) return sortedCountryCodes;
    const termDigits = raw.replace(/[^0-9+]/g, '');
    return sortedCountryCodes.filter((c) => {
      const countryNorm = normalizeCountry(c.country);
      const codeDigits = c.code.replace(/[^0-9+]/g, '');
      return (
        (term && countryNorm.includes(term)) ||
        (termDigits && codeDigits.includes(termDigits))
      );
    });
  }, [sortedCountryCodes, createCountrySearch]);

  const filteredEditCountries = useMemo(() => {
    const raw = editCountrySearch.trim();
    const term = normalizeCountry(raw);
    if (!term) return sortedCountryCodes;
    const termDigits = raw.replace(/[^0-9+]/g, '');
    return sortedCountryCodes.filter((c) => {
      const countryNorm = normalizeCountry(c.country);
      const codeDigits = c.code.replace(/[^0-9+]/g, '');
      return (
        (term && countryNorm.includes(term)) ||
        (termDigits && codeDigits.includes(termDigits))
      );
    });
  }, [sortedCountryCodes, editCountrySearch]);

  const sortedRoles = useMemo(
    () => [...roles].sort((a, b) => a.name.localeCompare(b.name)),
    [roles],
  );

  const selectableRoles = useMemo(() => {
    const base = sortedRoles.filter((r) => !/client/i.test(r.name));
    const ensureCodes: { code: string; name: string }[] = [
      { code: 'SYSTEM_ADMIN', name: 'Admin' },
      { code: 'MANAGER', name: 'Manager' },
      { code: 'MARKETING', name: 'Marketing' },
      { code: 'AGENT', name: 'Agent' },
      { code: 'DRIVER', name: 'Driver' },
    ];

    const existingCodes = new Set(base.map((r) => r.code));
    const synthetic = ensureCodes
      .filter((r) => !existingCodes.has(r.code))
      .map((r, idx) => ({
        id: `synthetic-${r.code}-${idx}`,
        name: r.name,
        code: r.code,
        description: '',
      }));

    const combined = [...base, ...synthetic];
    const order = ['SYSTEM_ADMIN', 'MANAGER', 'MARKETING', 'AGENT', 'DRIVER'];

    return combined.sort((a, b) => {
      const ia = order.indexOf(a.code);
      const ib = order.indexOf(b.code);
      const ra = ia === -1 ? Number.MAX_SAFE_INTEGER : ia;
      const rb = ib === -1 ? Number.MAX_SAFE_INTEGER : ib;
      if (ra !== rb) return ra - rb;
      return a.name.localeCompare(b.name);
    });
  }, [sortedRoles]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return users.filter((user) => {
      const matchesTerm =
        !term ||
        user.fullName.toLowerCase().includes(term) ||
        (user.username || '').toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term);

      const matchesRole =
        roleFilter === 'all' || user.role?.code === roleFilter;

      const matchesStatus =
        statusFilter === 'all' || user.status === statusFilter;

      return matchesTerm && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [usersData, rolesData] = await Promise.all([
        getUsers(),
        getRoles(),
      ]);

      setUsers(usersData);
      setRoles(rolesData);

      setCreateForm((prev) => ({
        ...prev,
        roleCode: prev.roleCode || rolesData[0]?.code || '',
      }));

      const adminRole = rolesData.find((r) => r.code === 'SYSTEM_ADMIN') || null;
      const agentRole = rolesData.find((r) => r.code === 'AGENT') || null;
      const driverRole = rolesData.find((r) => r.code === 'DRIVER') || null;
      setAdminRoleId(adminRole?.id ?? null);
      setAgentRoleId(agentRole?.id ?? null);
      setDriverRoleId(driverRole?.id ?? null);

      try {
        const permissionsData = await getPermissions();
        setAllPermissions(permissionsData || []);
        if (adminRole) {
          const rolePermIds = await getRolePermissionIds(adminRole.id);
          setSelectedPermissionIds(Array.isArray(rolePermIds) ? rolePermIds : []);
        } else {
          setSelectedPermissionIds([]);
        }
      } catch {
        setAllPermissions([]);
        setSelectedPermissionIds([]);
      }
    } catch {
      setError('Failed to load users data.');
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (id: string) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleCreateChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setCreateForm((prev) => {
      const next = { ...prev, [name]: value } as CreateUserPayload;
      const fieldErrors = validateCreateForm(next, createFormLastName);
      setCreateFieldErrors((prevErrs) => ({
        ...prevErrs,
        [name]: fieldErrors[name as keyof CreateUserPayload] ?? '',
      }));
      return next;
    });
  };

  const createPhoneNumberPart = createForm.phone.startsWith(createPhoneCountryCode)
    ? createForm.phone.slice(createPhoneCountryCode.length).replace(/\D/g, '')
    : '';

  const handleCreateCountrySelect = (code: string) => {
    setCreatePhoneCountryCode(code);
    setCreatePhoneDropdownOpen(false);
    const digits = createPhoneNumberPart;
    const maxLen = code === '+94' ? 9 : 15;
    const capped = code === '+94' && digits.length > 0 && digits[0] !== '7' ? '7' + digits.slice(0, 8) : digits.slice(0, maxLen);
    setCreateForm((prev) => {
      const next = { ...prev, phone: code + capped };
      const fieldErrors = validateCreateForm(next);
      setCreateFieldErrors((prevErrs) => ({ ...prevErrs, phone: fieldErrors.phone ?? '' }));
      return next;
    });
  };

  const handleCreatePhoneChange = (digits: string) => {
    const cleaned = digits.replace(/\D/g, '');
    const maxLen = createPhoneCountryCode === '+94' ? 9 : 15;
    const withLeading7 = createPhoneCountryCode === '+94' && cleaned.length > 0 && cleaned[0] !== '7' ? '7' + cleaned.slice(0, 8) : cleaned.slice(0, maxLen);
    const full = createPhoneCountryCode + withLeading7;
    setCreateForm((prev) => {
      const next = { ...prev, phone: full };
      const fieldErrors = validateCreateForm(next);
      setCreateFieldErrors((prevErrs) => ({ ...prevErrs, phone: fieldErrors.phone ?? '' }));
      return next;
    });
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => {
      const next = { ...prev, [name]: value } as UpdateUserPayload;
      const fieldErrors = validateEditForm(next, editFormLastName);
      setEditFieldErrors((prevErrs) => ({
        ...prevErrs,
        [name]: fieldErrors[name as keyof UpdateUserPayload] ?? '',
      }));
      return next;
    });
  };

  const editPhoneNumberPart = (editForm.phone || '').startsWith(editPhoneCountryCode)
    ? (editForm.phone || '').slice(editPhoneCountryCode.length).replace(/\D/g, '')
    : (editForm.phone || '').replace(/\D/g, '').slice(0, 15);

  const handleEditCountrySelect = (code: string) => {
    setEditPhoneCountryCode(code);
    setEditPhoneDropdownOpen(false);
    const digits = editPhoneNumberPart;
    const maxLen = code === '+94' ? 9 : 15;
    const capped = code === '+94' && digits.length > 0 && digits[0] !== '7' ? '7' + digits.slice(0, 8) : digits.slice(0, maxLen);
    setEditForm((prev) => {
      const next = { ...prev, phone: code + capped };
      const fieldErrors = validateEditForm(next, editFormLastName);
      setEditFieldErrors((prevErrs) => ({ ...prevErrs, phone: fieldErrors.phone ?? '' }));
      return next;
    });
  };

  const handleEditPhoneChange = (digits: string) => {
    const cleaned = digits.replace(/\D/g, '');
    const maxLen = editPhoneCountryCode === '+94' ? 9 : 15;
    const withLeading7 = editPhoneCountryCode === '+94' && cleaned.length > 0 && cleaned[0] !== '7' ? '7' + cleaned.slice(0, 8) : cleaned.slice(0, maxLen);
    const full = editPhoneCountryCode + withLeading7;
    setEditForm((prev) => {
      const next = { ...prev, phone: full };
      const fieldErrors = validateEditForm(next, editFormLastName);
      setEditFieldErrors((prevErrs) => ({ ...prevErrs, phone: fieldErrors.phone ?? '' }));
      return next;
    });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    const fieldErrors = validateCreateForm(createForm, createFormLastName);
    if (Object.values(fieldErrors).some(Boolean)) {
      setCreateFieldErrors(fieldErrors);
      setError('Please fix the errors below.');
      return;
    }

    setCreateFieldErrors({});
    setError('');

    try {
      setSaving(true);
      setSuccess('');

      const fullName = `${createForm.fullName.trim()} ${createFormLastName.trim()}`.trim();
      await createUser({
        ...createForm,
        fullName: fullName || createForm.fullName,
        phone: createForm.phone?.trim() ? createForm.phone : undefined,
      });

      if (createForm.roleCode === 'SYSTEM_ADMIN' && adminRoleId) {
        await updateRolePermissions(adminRoleId, selectedPermissionIds);
      } else if (createForm.roleCode === 'AGENT' && agentRoleId) {
        await updateRolePermissions(agentRoleId, selectedPermissionIds);
      } else if (createForm.roleCode === 'DRIVER' && driverRoleId) {
        await updateRolePermissions(driverRoleId, selectedPermissionIds);
      }

      setSuccess('User created successfully.');
      setCreateFieldErrors({});
      setCreateForm({
        ...initialCreateForm,
        roleCode: roles[0]?.code || '',
      });
      setCreateFormLastName('');
      setCreatePhoneCountryCode('+94');
      setCreatePhoneDropdownOpen(false);
      setCreateModalOpen(false);

      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create user.');
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = async (user: User) => {
    setEditingUser(user);
    const parts = (user.fullName || '').trim().split(/\s+/).filter(Boolean);
    const first = parts[0] ?? '';
    const last = parts.slice(1).join(' ');
    setEditFormLastName(last);
    let phone = (user.phone || '').trim();
    const matched = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length).find((c) => phone.startsWith(c.code));
    if (matched) {
      setEditPhoneCountryCode(matched.code);
      const rest = phone.slice(matched.code.length).replace(/\D/g, '');
      phone = matched.code + rest.slice(0, matched.code === '+94' ? 9 : 15);
    } else if (phone && !phone.startsWith('+')) {
      const digits = phone.replace(/\D/g, '').slice(-9);
      if (digits.length === 9 && digits[0] === '7') {
        phone = '+94' + digits;
        setEditPhoneCountryCode('+94');
      }
    } else {
      setEditPhoneCountryCode('+94');
    }
    setEditForm({
      fullName: first,
      username: user.username || '',
      email: user.email,
      phone,
      roleCode: user.role?.code || '',
      status: user.status,
    });
    setEditConfirmPassword('');

    // Load current permissions for this user's role so the panel reflects reality
    try {
      const roleCode = user.role?.code;
      let roleId: string | null = null;
      if (roleCode === 'SYSTEM_ADMIN') roleId = adminRoleId;
      else if (roleCode === 'AGENT') roleId = agentRoleId;
      else if (roleCode === 'DRIVER') roleId = driverRoleId;

      if (roleId) {
        const rolePermIds = await getRolePermissionIds(roleId);
        setSelectedPermissionIds(Array.isArray(rolePermIds) ? rolePermIds : []);
      }
    } catch {
      // If permissions fail to load, keep whatever is currently selected
    }
    setEditPhoneDropdownOpen(false);
    setEditFieldErrors({});
    setError('');
    setSuccess('');
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setEditForm(initialEditForm);
    setEditFormLastName('');
    setEditConfirmPassword('');
    setEditFieldErrors({});
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingUser) return;

    const fieldErrors = { ...validateEditForm(editForm, editFormLastName) };
    const newPassword = (editForm.password ?? '').trim();
    if (newPassword) {
      if (newPassword.length < 6) {
        fieldErrors.password = 'Password must be at least 6 characters.';
      } else if (
        (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword))
      ) {
        fieldErrors.password =
          'Password must include uppercase, lowercase and a special character.';
      } else if (newPassword !== editConfirmPassword.trim()) {
        fieldErrors.password = 'Passwords do not match.';
      }
    } else if (editConfirmPassword.trim()) {
      fieldErrors.password = 'Enter new password in both fields to change it.';
    }

    if (Object.values(fieldErrors).some(Boolean)) {
      setEditFieldErrors(fieldErrors);
      setError('Please fix the errors below.');
      return;
    }

    setEditFieldErrors({});
    setError('');

    try {
      setEditingSave(true);
      setSuccess('');

      const fullName = `${(editForm.fullName ?? '').trim()} ${editFormLastName.trim()}`.trim();
      const payload: UpdateUserPayload = {
        ...editForm,
        fullName: fullName || editForm.fullName,
        phone: editForm.phone?.trim() ? editForm.phone : undefined,
      };
      if (!newPassword) delete payload.password;
      else payload.password = newPassword;

      await updateUser(editingUser.id, payload);

      if (editForm.roleCode === 'SYSTEM_ADMIN' && adminRoleId) {
        await updateRolePermissions(adminRoleId, selectedPermissionIds);
      } else if (editForm.roleCode === 'AGENT' && agentRoleId) {
        await updateRolePermissions(agentRoleId, selectedPermissionIds);
      } else if (editForm.roleCode === 'DRIVER' && driverRoleId) {
        await updateRolePermissions(driverRoleId, selectedPermissionIds);
      }

      setSuccess('User updated successfully.');
      closeEditModal();
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update user.');
    } finally {
      setEditingSave(false);
    }
  };

  const openStatusToggleConfirm = (user: User) => {
    setStatusToggleUser(user);
    setError('');
    setSuccess('');
  };

  const handleConfirmStatusToggle = async () => {
    if (!statusToggleUser) return;

    try {
      setStatusToggleLoading(true);
      setError('');
      setSuccess('');

      const nextStatus: UserStatus =
        statusToggleUser.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

      await updateUserStatus(statusToggleUser.id, nextStatus);
      setSuccess(`User ${nextStatus === 'ACTIVE' ? 'activated' : 'disabled'} successfully.`);
      setStatusToggleUser(null);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update status.');
    } finally {
      setStatusToggleLoading(false);
    }
  };

  const handleDeleteUser = (user: User) => {
    setDeletingUser(user);
    setDeleteConfirmText('');
    setError('');
    setSuccess('');
  };

  const handleConfirmDeleteUser = async () => {
    if (!deletingUser || deleteConfirmText !== 'DELETE') return;

    try {
      setDeleting(true);
      setError('');
      setSuccess('');
      await deleteUser(deletingUser.id);
      setSuccess('User deleted successfully.');
      setDeletingUser(null);
      setDeleteConfirmText('');
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete user.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="mt-1 text-2xl font-bold">Users Management</h1>
              <p className="mt-1 text-sm text-slate-400">
                Create, edit, and control access for platform users.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                // Pre-select role in the form based on active role tab when opening
                setCreateForm((prev) => {
                  const fallback =
                    prev.roleCode || roles[0]?.code || 'SYSTEM_ADMIN';
                  if (roleFilter === 'all') {
                    return { ...prev, roleCode: fallback };
                  }
                  return { ...prev, roleCode: roleFilter };
                });
                setCreateModalOpen(true);
              }}
              className="rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              Create User
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: 'All users', value: 'all' },
              { label: 'Admin', value: 'SYSTEM_ADMIN' },
              { label: 'Manager', value: 'MANAGER' },
              { label: 'Marketing', value: 'MARKETING' },
              { label: 'Agent', value: 'AGENT' },
              { label: 'Driver', value: 'DRIVER' },
            ].map((tab) => {
              const isActive = roleFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setRoleFilter(tab.value)}
                  className={`rounded-2xl border p-3 text-left text-xs font-medium uppercase tracking-wider transition focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                    isActive
                      ? 'border-emerald-500/60 bg-emerald-500/15 ring-2 ring-emerald-500/30 text-emerald-100'
                      : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                >
                  <span className="block text-[11px]">{tab.label}</span>
                </button>
              );
            })}
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

        {createModalOpen ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => !saving && setCreateModalOpen(false)}
          >
            <div
              className="max-h-[90vh] w-full max-w-[96vw] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-xl sm:p-6 md:max-w-[90vw] lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                <h3 className="text-lg font-semibold">Create New User</h3>
                <button
                  type="button"
                  onClick={() => !saving && setCreateModalOpen(false)}
                  className="rounded-xl border border-slate-600 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
                >
                  Close
                </button>
              </div>
              <p className="mt-2 text-sm text-slate-400">
                Add admin, agent, driver, or shop portal user.
              </p>
              <form onSubmit={handleCreateUser} className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  value={createForm.email}
                  onChange={handleCreateChange}
                  className={`w-full rounded-2xl border bg-slate-950 px-4 py-3 outline-none ${
                    createFieldErrors.email ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-emerald-500'
                  }`}
                  placeholder="Enter email"
                />
                {createFieldErrors.email && (
                  <p className="mt-1 text-xs text-red-400">{createFieldErrors.email}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Username <span className="text-red-400">*</span>
                </label>
                <input
                  name="username"
                  value={createForm.username}
                  onChange={handleCreateChange}
                  className={`w-full rounded-2xl border bg-slate-950 px-4 py-3 outline-none ${
                    createFieldErrors.username ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-emerald-500'
                  }`}
                  placeholder="Enter username (letters, numbers, . _ -)"
                />
                {createFieldErrors.username && (
                  <p className="mt-1 text-xs text-red-400">{createFieldErrors.username}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  First Name <span className="text-red-400">*</span>
                </label>
                <input
                  name="fullName"
                  value={createForm.fullName}
                  onChange={handleCreateChange}
                  className={`w-full rounded-2xl border bg-slate-950 px-4 py-3 outline-none ${
                    createFieldErrors.fullName ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-emerald-500'
                  }`}
                  placeholder="Enter first name"
                />
                {createFieldErrors.fullName && (
                  <p className="mt-1 text-xs text-red-400">{createFieldErrors.fullName}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Last Name
                </label>
                <input
                  name="lastName"
                  value={createFormLastName}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCreateFormLastName(value);
                    const combinedName = `${createForm.fullName.trim()} ${value.trim()}`.trim() || createForm.fullName.trim();
                    const fieldErrors = validateCreateForm(
                      { ...createForm, fullName: combinedName || createForm.fullName },
                      value,
                    );
                    setCreateFieldErrors((prev) => ({
                      ...prev,
                      fullName: fieldErrors.fullName ?? '',
                    }));
                  }}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder="(Optional)"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Phone <span className="text-red-400">*</span>
                </label>
                <div className={`flex gap-0 rounded-2xl border bg-slate-950 ${
                  createFieldErrors.phone ? 'border-red-500' : 'border-slate-700'
                } focus-within:outline focus-within:ring-1 focus-within:ring-emerald-500`}>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setCreateCountrySearch('');
                        setCreatePhoneDropdownOpen((o) => !o);
                      }}
                      className="flex min-w-[7rem] items-center gap-2 rounded-l-2xl border-r border-slate-700 bg-slate-900 px-3 py-3 text-left text-sm text-slate-200"
                    >
                      <span className="text-lg" aria-hidden>
                        {COUNTRY_CODES.find((c) => c.code === createPhoneCountryCode)?.flag ?? '🇱🇰'}
                      </span>
                      <span className="font-medium">{createPhoneCountryCode}</span>
                      <span className="ml-auto text-slate-500">▾</span>
                    </button>
                    {createPhoneDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setCreatePhoneDropdownOpen(false)}
                          aria-hidden
                        />
                        <div className="absolute left-0 top-full z-20 mt-1 w-64 rounded-xl border border-slate-700 bg-slate-900 py-1 shadow-xl">
                          <div className="px-2 pb-1">
                            <input
                              type="text"
                              value={createCountrySearch}
                              onChange={(e) => setCreateCountrySearch(e.target.value)}
                              placeholder="Search country or code"
                              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs outline-none focus:border-emerald-500"
                            />
                          </div>
                          <ul className="max-h-56 overflow-auto">
                            {filteredCreateCountries.map((c) => (
                              <li key={`${c.code}-${c.country}`}>
                                <button
                                  type="button"
                                  onClick={() => handleCreateCountrySelect(c.code)}
                                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-800 ${
                                    createPhoneCountryCode === c.code ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-200'
                                  }`}
                                >
                                  <span className="text-xl">{c.flag}</span>
                                  <span>{c.country}</span>
                                  <span className="text-slate-400">{c.code}</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={createPhoneCountryCode === '+94' ? 9 : 15}
                    value={createPhoneNumberPart}
                    onChange={(e) => handleCreatePhoneChange(e.target.value)}
                    className="w-full rounded-r-2xl bg-transparent px-4 py-3 outline-none"
                    placeholder={createPhoneCountryCode === '+94' ? '7XXXXXXXX' : 'Mobile number'}
                  />
                </div>
                {createFieldErrors.phone && (
                  <p className="mt-1 text-xs text-red-400">{createFieldErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Password <span className="text-red-400">*</span>
                </label>
                <input
                  name="password"
                  type="password"
                  value={createForm.password}
                  onChange={handleCreateChange}
                  className={`w-full rounded-2xl border bg-slate-950 px-4 py-3 outline-none ${
                    createFieldErrors.password ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-emerald-500'
                  }`}
                  placeholder="Enter password (min 6 characters)"
                />
                {createFieldErrors.password && (
                  <p className="mt-1 text-xs text-red-400">{createFieldErrors.password}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Role <span className="text-red-400">*</span>
                </label>
                <select
                  name="roleCode"
                  value={createForm.roleCode}
                  onChange={handleCreateChange}
                  className={`w-full rounded-2xl border bg-slate-950 px-4 py-3 outline-none ${
                    createFieldErrors.roleCode ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-emerald-500'
                  }`}
                >
                  <option value="">Select role</option>
                  {selectableRoles.map((role) => (
                    <option key={role.id} value={role.code}>
                      {role.name}
                    </option>
                  ))}
                </select>
                {createFieldErrors.roleCode && (
                  <p className="mt-1 text-xs text-red-400">{createFieldErrors.roleCode}</p>
                )}
              </div>

              {(createForm.roleCode === 'SYSTEM_ADMIN' ||
                createForm.roleCode === 'AGENT' ||
                createForm.roleCode === 'DRIVER') && (
                <div className="md:col-span-2 mt-4 rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <h3 className="text-sm font-semibold text-slate-100">
                    Manage User Permissions
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Choose what this role can manage across modules.
                  </p>

                  {allPermissions.length === 0 ? (
                    <p className="mt-3 text-xs text-amber-400">
                      No permissions loaded. Run seed:{' '}
                      <code className="rounded bg-slate-800 px-1">
                        cd server && npx prisma db seed
                      </code>
                    </p>
                  ) : (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {Array.from(
                        allPermissions.reduce<Map<string, Permission[]>>(
                          (map, perm) => {
                            const group = map.get(perm.module) ?? [];
                            group.push(perm);
                            map.set(perm.module, group);
                            return map;
                          },
                          new Map(),
                        ),
                      ).map(([module, perms]) => (
                        <div
                          key={module}
                          className="rounded-2xl border border-slate-800 bg-slate-900 p-3"
                        >
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                            {module}
                          </h4>
                          <div className="mt-2 space-y-1">
                            {perms.map((perm) => (
                              <label
                                key={perm.id}
                                className="flex items-center gap-2 text-xs text-slate-300"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedPermissionIds.includes(perm.id)}
                                  onChange={() => togglePermission(perm.id)}
                                  className="h-3 w-3 rounded border-slate-600 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                                />
                                <span className="break-words">{perm.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="md:col-span-2 flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="min-w-[140px] rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
                >
                  {saving ? 'Creating...' : 'Create User'}
                </button>
              </div>
              </form>
            </div>
          </div>
        ) : null}

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold">User Directory</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Current users and assigned access levels.
                </p>
              </div>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wide text-slate-400">
                    Total
                  </span>
                  <div className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-300">
                    {filteredUsers.length} / {users.length}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search name, username, email..."
                    className="w-52 rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs outline-none focus:border-emerald-500"
                  />
                  {/* role filter handled by top tabs */}
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value as 'all' | UserStatus)
                    }
                    className="w-32 rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs outline-none focus:border-emerald-500"
                  >
                    <option value="all">All status</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              {loading ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-10 text-center text-slate-400">
                  Loading users...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-10 text-center text-slate-400">
                  No users match your filters.
                </div>
              ) : (
                <table className="min-w-full overflow-hidden rounded-2xl border border-slate-800">
                  <thead className="bg-slate-950">
                    <tr className="text-left text-sm text-slate-400">
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Username</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Created</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-t border-slate-800 bg-slate-900 text-sm"
                      >
                        <td className="px-4 py-3 font-medium text-white">
                          {user.fullName}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {user.username || '-'}
                        </td>
                        <td className="px-4 py-3 text-slate-300">{user.email}</td>
                        <td className="px-4 py-3 text-slate-300">
                          {user.role?.name || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              user.status === 'ACTIVE'
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-amber-500/15 text-amber-400'
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          {new Date(user.createdAt).toISOString().slice(0, 10)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => void openEditModal(user)}
                              className="rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => openStatusToggleConfirm(user)}
                              className="rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800"
                            >
                              {user.status === 'ACTIVE' ? 'Disable' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="rounded-xl border border-red-700 bg-red-900/40 px-3 py-2 text-xs text-red-200 hover:bg-red-800/70"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        {editingUser && (
          <div className="fixed inset-0 z-50 flex justify-center overflow-y-auto bg-black/60 p-4">
            <div className="my-4 w-full max-w-[96vw] rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-2xl sm:my-8 sm:p-6 md:max-w-[90vw] lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Edit User</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Update user details and access level.
                  </p>
                </div>
                <button
                  onClick={closeEditModal}
                  className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleEditUser} className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">First Name</label>
                  <input
                    name="fullName"
                    value={editForm.fullName || ''}
                    onChange={handleEditChange}
                    className={`w-full rounded-2xl border bg-slate-950 px-4 py-3 outline-none ${
                      editFieldErrors.fullName ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-emerald-500'
                    }`}
                    placeholder="Enter first name"
                  />
                  {editFieldErrors.fullName && (
                    <p className="mt-1 text-xs text-red-400">{editFieldErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Last Name</label>
                  <input
                    name="lastName"
                    value={editFormLastName}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditFormLastName(value);
                      const fieldErrors = validateEditForm(editForm, value);
                      setEditFieldErrors((prev) => ({ ...prev, fullName: fieldErrors.fullName ?? '' }));
                    }}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-emerald-500"
                    placeholder="(Optional)"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Username</label>
                  <input
                    name="username"
                    value={editForm.username || ''}
                    onChange={handleEditChange}
                    className={`w-full rounded-2xl border bg-slate-950 px-4 py-3 outline-none ${
                      editFieldErrors.username ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-emerald-500'
                    }`}
                  />
                  {editFieldErrors.username && (
                    <p className="mt-1 text-xs text-red-400">{editFieldErrors.username}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={editForm.email || ''}
                    onChange={handleEditChange}
                    className={`w-full rounded-2xl border bg-slate-950 px-4 py-3 outline-none ${
                      editFieldErrors.email ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-emerald-500'
                    }`}
                  />
                  {editFieldErrors.email && (
                    <p className="mt-1 text-xs text-red-400">{editFieldErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Phone <span className="text-red-400">*</span>
                  </label>
                  <div className={`flex gap-0 rounded-2xl border bg-slate-950 ${
                    editFieldErrors.phone ? 'border-red-500' : 'border-slate-700'
                  } focus-within:outline focus-within:ring-1 focus-within:ring-emerald-500`}>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setEditCountrySearch('');
                          setEditPhoneDropdownOpen((o) => !o);
                        }}
                        className="flex min-w-[7rem] items-center gap-2 rounded-l-2xl border-r border-slate-700 bg-slate-900 px-3 py-3 text-left text-sm text-slate-200"
                      >
                        <span className="text-lg" aria-hidden>
                          {COUNTRY_CODES.find((c) => c.code === editPhoneCountryCode)?.flag ?? '🇱🇰'}
                        </span>
                        <span className="font-medium">{editPhoneCountryCode}</span>
                        <span className="ml-auto text-slate-500">▾</span>
                      </button>
                      {editPhoneDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setEditPhoneDropdownOpen(false)}
                            aria-hidden
                          />
                          <div className="absolute left-0 top-full z-20 mt-1 w-64 rounded-xl border border-slate-700 bg-slate-900 py-1 shadow-xl">
                            <div className="px-2 pb-1">
                              <input
                                type="text"
                                value={editCountrySearch}
                                onChange={(e) => setEditCountrySearch(e.target.value)}
                                placeholder="Search country or code"
                                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs outline-none focus:border-emerald-500"
                              />
                            </div>
                            <ul className="max-h-56 overflow-auto">
                              {filteredEditCountries.map((c) => (
                                <li key={`${c.code}-${c.country}`}>
                                  <button
                                    type="button"
                                    onClick={() => handleEditCountrySelect(c.code)}
                                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-800 ${
                                      editPhoneCountryCode === c.code ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-200'
                                    }`}
                                  >
                                    <span className="text-xl">{c.flag}</span>
                                    <span>{c.country}</span>
                                    <span className="text-slate-400">{c.code}</span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={editPhoneCountryCode === '+94' ? 9 : 15}
                      value={editPhoneNumberPart}
                      onChange={(e) => handleEditPhoneChange(e.target.value)}
                      className="w-full rounded-r-2xl bg-transparent px-4 py-3 outline-none"
                      placeholder={editPhoneCountryCode === '+94' ? '7XXXXXXXX' : 'Mobile number'}
                    />
                  </div>
                  {editFieldErrors.phone && (
                    <p className="mt-1 text-xs text-red-400">{editFieldErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Role</label>
                  <select
                    name="roleCode"
                    value={editForm.roleCode || ''}
                    onChange={handleEditChange}
                    className={`w-full rounded-2xl border bg-slate-950 px-4 py-3 outline-none ${
                      editFieldErrors.roleCode ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-emerald-500'
                    }`}
                    >
                    <option value="">Select role</option>
                    {selectableRoles.map((role) => (
                      <option key={role.id} value={role.code}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  {editFieldErrors.roleCode && (
                    <p className="mt-1 text-xs text-red-400">{editFieldErrors.roleCode}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">Status</label>
                  <select
                    name="status"
                    value={editForm.status || 'ACTIVE'}
                    onChange={handleEditChange}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>

                <div className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <h3 className="text-sm font-semibold text-slate-100">
                    Set new password (optional)
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Leave blank to keep the current password. Min 6 characters; include uppercase, lowercase and a special character.
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-400">
                        New password
                      </label>
                      <input
                        name="password"
                        type="password"
                        value={editForm.password ?? ''}
                        onChange={handleEditChange}
                        placeholder="Enter new password"
                        className={`w-full rounded-2xl border bg-slate-950 px-4 py-3 text-sm outline-none ${
                          editFieldErrors.password ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-emerald-500'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-400">
                        Confirm new password
                      </label>
                      <input
                        type="password"
                        value={editConfirmPassword}
                        onChange={(e) => setEditConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className={`w-full rounded-2xl border bg-slate-950 px-4 py-3 text-sm outline-none ${
                          editFieldErrors.password ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-emerald-500'
                        }`}
                      />
                    </div>
                  </div>
                  {editFieldErrors.password && (
                    <p className="mt-2 text-xs text-red-400">{editFieldErrors.password}</p>
                  )}
                </div>

                {(editForm.roleCode === 'SYSTEM_ADMIN' ||
                  editForm.roleCode === 'AGENT' ||
                  editForm.roleCode === 'DRIVER') && (
                  <div className="md:col-span-2 mt-4 rounded-2xl border border-slate-800 bg-slate-950 p-4">
                    <h3 className="text-sm font-semibold text-slate-100">
                      Manage User Permissions
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">
                      Choose what this role can manage across modules.
                    </p>

                    {allPermissions.length === 0 ? (
                      <p className="mt-3 text-xs text-amber-400">
                        No permissions loaded. Run seed:{' '}
                        <code className="rounded bg-slate-800 px-1">
                          cd server && npx prisma db seed
                        </code>
                      </p>
                    ) : (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {Array.from(
                          allPermissions.reduce<Map<string, Permission[]>>(
                            (map, perm) => {
                              const group = map.get(perm.module) ?? [];
                              group.push(perm);
                              map.set(perm.module, group);
                              return map;
                            },
                            new Map(),
                          ),
                        ).map(([module, perms]) => (
                          <div
                            key={module}
                            className="rounded-xl border border-slate-800 bg-slate-900 p-3"
                          >
                            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-300">
                              {module}
                            </div>
                            <div className="space-y-1">
                              {perms.map((perm) => (
                                <label
                                  key={perm.id}
                                  className="flex cursor-pointer items-center gap-2 text-xs text-slate-300"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedPermissionIds.includes(perm.id)}
                                    onChange={() => togglePermission(perm.id)}
                                    className="h-3 w-3 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                                  />
                                  <span className="break-words">{perm.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="rounded-2xl border border-slate-700 px-4 py-3 text-sm text-slate-200 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editingSave}
                    className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
                  >
                    {editingSave ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {statusToggleUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <h2 className="text-lg font-semibold text-amber-300">
                {statusToggleUser.status === 'ACTIVE' ? 'Disable User' : 'Activate User'}
              </h2>
              <p className="mt-3 text-sm text-slate-300">
                {statusToggleUser.status === 'ACTIVE' ? (
                  <>
                    Disable <span className="font-semibold">{statusToggleUser.fullName}</span>? They will no longer be able to log in until an admin activates the account.
                  </>
                ) : (
                  <>
                    Activate <span className="font-semibold">{statusToggleUser.fullName}</span>? They will be able to log in again.
                  </>
                )}
              </p>
              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setStatusToggleUser(null)}
                  className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
                  disabled={statusToggleLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmStatusToggle}
                  disabled={statusToggleLoading}
                  className="rounded-2xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500 disabled:opacity-60"
                >
                  {statusToggleLoading
                    ? 'Updating...'
                    : statusToggleUser.status === 'ACTIVE'
                      ? 'Disable'
                      : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        )}

        {deletingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <h2 className="text-lg font-semibold text-red-300">Delete User</h2>
              <p className="mt-3 text-sm text-slate-300">
                You are about to permanently delete{' '}
                <span className="font-semibold">{deletingUser.fullName}</span>. This will remove
                their login access and any direct user-level settings. Historical records (orders,
                returns, logs) will remain linked to this user but the account itself cannot be
                recovered.
              </p>
              <p className="mt-3 text-xs text-slate-400">
                To confirm, type <span className="font-mono font-semibold text-red-300">DELETE</span>{' '}
                in the box below and click <span className="font-semibold">Delete User</span>.
              </p>

              <input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="mt-4 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-red-500"
              />

              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDeletingUser(null);
                    setDeleteConfirmText('');
                  }}
                  className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteUser}
                  disabled={deleting || deleteConfirmText !== 'DELETE'}
                  className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
                >
                  {deleting ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}