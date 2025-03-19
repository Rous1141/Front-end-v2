"use client";
import {
    Edit,
    Email,
    Logout,
    AccountCircle,
    Verified,
    Schedule,
    CalendarToday,
    Close,
} from "@mui/icons-material";
import {
    Avatar,
    Box,
    Button,
    Divider,
    Grid,
    IconButton,
    TextField,
    Typography,
    Paper,
    Modal,
    Fade,
    Backdrop,
    CircularProgress,
    Alert,
    Snackbar,
    Select,
    MenuItem,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { updateUserAvatar } from "../../../api/Account/Account";
import LoadingScreen from "../../common/LoadingScreen";
import { getPatientByAccountId, updatePatientProfile } from "../../../api/Account/Seeker";
import { getAccountById } from "../../../api/Account/Account";

interface PatientInfo {
    patientId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    phoneNumber: string;
}
interface AccountInfo {
    accountName: string;
    email: string;
    lastLogin: string;
    isEmailVerified: boolean;
    createdAt: string;
}

interface PatientUpdate {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    phoneNumber: string;
}

export const Frame = () => {
    const [openEdit, setOpenEdit] = useState(false);
    const [profile, setProfile] = useState({
        accountName: "",
        email: "",
        lastLogin: "",
        isEmailVerified: false,
        createdAt: "",
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const nav = useNavigate();
    const [avatarUrl, setAvatarUrl] = useState<string>("");
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error'
    });
    const [openImageModal, setOpenImageModal] = useState(false);
    const [patientInfo, setPatientInfo] = useState<PatientInfo>({
        patientId: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        phoneNumber: ''
    });
    const [editForm, setEditForm] = useState<PatientInfo>({
        patientId: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        phoneNumber: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const accountData = sessionStorage.getItem("account");
                if (!accountData) {
                    setError("Không tìm thấy thông tin tài khoản trong sessionStorage.");
                    return;
                }

                const { UserId } = JSON.parse(accountData);
                if (!UserId) {
                    setError("Không tìm thấy UserId trong sessionStorage.");
                    return;
                }

                // Fetch cả account và patient data
                const [accountResponse, patientResponse] = await Promise.all([
                    getAccountById(UserId),
                    getPatientByAccountId(UserId)
                ]);

                // Xử lý account data
                if (accountResponse?.result) {
                    setProfile({
                        accountName: accountResponse.result.accountName || "",
                        email: accountResponse.result.email || "",
                        lastLogin: accountResponse.result.lastLogin || "",
                        isEmailVerified: accountResponse.result.isEmailVerified || false,
                        createdAt: accountResponse.result.createdAt || "",
                    });
                    setAvatarUrl(accountResponse.result.avatar || "");
                } else {
                    setError("Dữ liệu tài khoản không hợp lệ.");
                }

                // Xử lý patient data
                if (patientResponse?.result) {
                    setPatientInfo({
                        patientId: patientResponse.result.patientId || "",
                        firstName: patientResponse.result.firstName || "",
                        lastName: patientResponse.result.lastName || "",
                        dateOfBirth: patientResponse.result.dob || "",
                        gender: patientResponse.result.gender || "",
                        phoneNumber: patientResponse.result.phoneNumber || ""
                    });
                }
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Đã xảy ra lỗi khi tải thông tin.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatDateForEdit = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - (offset * 60 * 1000));
        return localDate.toISOString().split('T')[0];
    };

    const handleOpenEdit = () => {
        setEditForm({
            ...patientInfo,
            patientId: patientInfo.patientId,
            dateOfBirth: formatDateForEdit(patientInfo.dateOfBirth)
        });
        setOpenEdit(true);
    };

    const handleCloseEdit = () => {
        setOpenEdit(false);
    };

    const handleOpenImage = () => setOpenImageModal(true);
    const handleCloseImage = () => setOpenImageModal(false);

    const logout = () => {
        sessionStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("patient")
        sessionStorage.removeItem("account");
        nav("/", { replace: true });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setUploadingAvatar(true);
            setError(null);

            const accountData = sessionStorage.getItem("account");
            if (!accountData) {
                throw new Error("Không tìm thấy thông tin tài khoản");
            }

            const { UserId } = JSON.parse(accountData);
            if (!UserId) {
                throw new Error("Không tìm thấy UserId");
            }

            // Tạo URL tạm thời cho file ảnh để preview
            const tempUrl = URL.createObjectURL(file);

            const result = await updateUserAvatar(file, UserId);

            if (result?.isSuccess) {  // Kiểm tra kỹ cấu trúc response
                // Cập nhật URL avatar với URL thật từ API
                setAvatarUrl(tempUrl);
                setSnackbar({
                    open: true,
                    message: 'Cập nhật ảnh đại diện thành công!',
                    severity: 'success'
                });
            } else {
                // Nếu không có URL trong response, sử dụng URL tạm thời
                setAvatarUrl(tempUrl);
                setSnackbar({
                    open: true,
                    message: 'Đã lưu ảnh nhưng có thể cần refresh để hiển thị chính xác',
                    severity: 'success'
                });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi cập nhật avatar');
            setSnackbar({
                open: true,
                message: err instanceof Error ? err.message : 'Đã xảy ra lỗi khi cập nhật avatar',
                severity: 'error'
            });
            console.error('Error:', err);
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const handleUpdateProfile = async () => {
        try {
            const accountData = sessionStorage.getItem("account");
            if (!accountData) {
                setSnackbar({
                    open: true,
                    message: 'Không tìm thấy thông tin tài khoản',
                    severity: 'error'
                });
                return;
            }

            const { UserId } = JSON.parse(accountData);
            if (!UserId) {
                setSnackbar({
                    open: true,
                    message: 'Không tìm thấy ID người dùng',
                    severity: 'error'
                });
                return;
            }

            // Set loading state nếu cần
            // setLoading(true);

            // Format lại date trước khi gửi lên server
            const formattedData = {
                id: patientInfo.patientId,
                ...editForm,
            };

            // Gọi API update với UserId
            const response = await updatePatientProfile(formattedData);

            if (response?.isSuccess) {
                // Cập nhật state với dữ liệu mới
                setPatientInfo(formattedData);

                // Hiển thị thông báo thành công
                setSnackbar({
                    open: true,
                    message: 'Cập nhật thông tin thành công!',
                    severity: 'success'
                });

                // Đóng modal
                handleCloseEdit();
            } else {
                throw new Error(response?.errorMessage || 'Cập nhật không thành công');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setSnackbar({
                open: true,
                message: error instanceof Error ? error.message : 'Có lỗi xảy ra khi cập nhật thông tin',
                severity: 'error'
            });
        } finally {
            // setLoading(false);
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Typography variant="h6" color="error">
                    {error} - Kiểm tra console để biết thêm chi tiết.
                </Typography>
            </Box>
        );
    }

    return (
        <>
            <Box
                display="flex"
                justifyContent="center"
                py={5}
                px={{ xs: 2, md: 4 }}
                sx={{ background: "linear-gradient(135deg, #0077B6, #1B9DF0)" }}
            >
                <Box width="100%" maxWidth="1400px">
                    <Grid container spacing={4}>
                        {/* Profile Section */}
                        <Grid item xs={12} md={4}>
                            <Paper
                                elevation={6}
                                sx={{
                                    p: 4,
                                    borderRadius: 3,
                                    bgcolor: "#FFFFFF",
                                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.15)",
                                        transform: "translateY(-5px)",
                                    },
                                }}
                            >
                                <Box display="flex" flexDirection="column" alignItems="center">
                                    <Box position="relative">
                                        <Avatar
                                            src={avatarUrl}
                                            key={avatarUrl}
                                            onClick={handleOpenImage}
                                            sx={{
                                                width: 120,
                                                height: 120,
                                                background: "linear-gradient(180deg, #027FC1 0%, #1B9DF0 100%)",
                                                border: "4px solid #E3F2FD",
                                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                                transition: "all 0.3s ease",
                                                cursor: 'pointer',
                                                "&:hover": {
                                                    transform: "scale(1.05)",
                                                    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.2)"
                                                },
                                            }}
                                        >
                                            {!avatarUrl && <AccountCircle sx={{ fontSize: 60, color: "#FFFFFF" }} />}
                                        </Avatar>
                                        <IconButton
                                            component="label"
                                            disabled={uploadingAvatar}
                                            sx={{
                                                position: 'absolute',
                                                bottom: 0,
                                                right: 0,
                                                backgroundColor: '#fff',
                                                '&:hover': { backgroundColor: '#e3f2fd' },
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                            }}
                                        >
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                            {uploadingAvatar ? (
                                                <CircularProgress size={20} sx={{ color: '#027FC1' }} />
                                            ) : (
                                                <Edit fontSize="small" sx={{ color: '#027FC1' }} />
                                            )}
                                        </IconButton>
                                    </Box>
                                    <Typography
                                        variant="h5"
                                        color="#027FC1"
                                        mt={3}
                                        fontWeight="bold"
                                        textAlign="center"
                                    >
                                        {profile.accountName}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" mt={1}>
                                        <CalendarToday fontSize="small" sx={{ verticalAlign: "middle", mr: 1 }} />
                                        Joined: {formatDate(profile.createdAt)}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" mt={1}>
                                        <Schedule fontSize="small" sx={{ verticalAlign: "middle", mr: 1 }} />
                                        Last Login: {formatDate(profile.lastLogin)}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color={profile.isEmailVerified ? "success.main" : "error.main"}
                                        mt={1}
                                    >
                                        <Verified fontSize="small" sx={{ verticalAlign: "middle", mr: 1 }} />
                                        Email Verified: {profile.isEmailVerified ? "Yes" : "No"}
                                    </Typography>
                                </Box>
                                <Divider sx={{ my: 3, borderColor: "#E3F2FD" }} />
                                <Box>
                                    <Box display="flex" alignItems="center" mb={2}>
                                        <Email sx={{ color: "#027FC1" }} />
                                        <Typography variant="body2" color="textSecondary" ml={2} flexGrow={1}>
                                            {profile.email || "Not provided"}
                                        </Typography>
                                        {/* <IconButton size="small" onClick={handleOpenEdit} sx={{ "&:hover": { color: "#027FC1" } }}>
                                            <Edit fontSize="small" />
                                        </IconButton> */}
                                    </Box>
                                    <Divider sx={{ borderColor: "#E3F2FD" }} />
                                    <Box
                                        onClick={logout}
                                        display="flex"
                                        alignItems="center"
                                        mt={2}
                                        sx={{
                                            cursor: "pointer",
                                            transition: "all 0.3s ease",
                                            "&:hover": { bgcolor: "#FFEBEE", borderRadius: 1 },
                                        }}
                                    >
                                        <Logout color="error" />
                                        <Typography variant="body2" color="error" ml={2} flexGrow={1}>
                                            Sign Out
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Contact Information */}
                        <Grid item xs={12} md={8}>
                            <Paper
                                elevation={6}
                                sx={{
                                    p: 4,
                                    borderRadius: 3,
                                    bgcolor: "#FFFFFF",
                                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.15)",
                                        transform: "translateY(-5px)",
                                    },
                                }}
                            >
                                {/* Account Information Section */}
                                <Box mb={4}>
                                    <Typography variant="h6" color="#027FC1" fontWeight="medium" mb={3}>
                                        Thông tin tài khoản
                                    </Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <Typography variant="body1" color="textSecondary" fontWeight="medium">
                                                Tên tài khoản
                                            </Typography>
                                            <Box display="flex" alignItems="center" mt={1}>
                                                <TextField
                                                    variant="outlined"
                                                    size="small"
                                                    fullWidth
                                                    value={profile.accountName}
                                                    disabled
                                                    sx={{
                                                        "& .MuiOutlinedInput-root": {
                                                            borderRadius: 2,
                                                            "&:hover fieldset": { borderColor: "#027FC1" },
                                                            "&.Mui-focused fieldset": { borderColor: "#027FC1" },
                                                        },
                                                    }}
                                                />
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="body1" color="textSecondary" fontWeight="medium">
                                                Email
                                            </Typography>
                                            <Box display="flex" alignItems="center" mt={1}>
                                                <TextField
                                                    variant="outlined"
                                                    size="small"
                                                    fullWidth
                                                    value={profile.email || ""}
                                                    disabled
                                                    sx={{
                                                        "& .MuiOutlinedInput-root": {
                                                            borderRadius: 2,
                                                            "&:hover fieldset": { borderColor: "#027FC1" },
                                                            "&.Mui-focused fieldset": { borderColor: "#027FC1" },
                                                        },
                                                    }}
                                                />
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Box>

                                {/* Divider */}
                                <Divider sx={{ my: 3, borderColor: "#E3F2FD" }} />

                                {/* Personal Information Section */}
                                <Box>

                                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                                        <Typography variant="h6" color="#027FC1" fontWeight="medium">
                                            Thông tin cá nhân
                                        </Typography>
                                        <IconButton
                                            size="small"
                                            onClick={handleOpenEdit}
                                            sx={{
                                                color: '#027FC1',
                                                bgcolor: 'rgba(2, 127, 193, 0.04)',
                                                '&:hover': {
                                                    bgcolor: 'rgba(2, 127, 193, 0.08)',
                                                    color: '#027FC1'
                                                }
                                            }}
                                        >
                                            <Edit fontSize="medium" />
                                        </IconButton>
                                    </Box>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="body1" color="textSecondary" fontWeight="medium">
                                                Họ
                                            </Typography>
                                            <TextField
                                                variant="outlined"
                                                size="small"
                                                fullWidth
                                                value={patientInfo.lastName}
                                                disabled
                                                sx={{
                                                    mt: 1,
                                                    "& .MuiOutlinedInput-root": {
                                                        borderRadius: 2,
                                                        bgcolor: 'rgba(0, 0, 0, 0.02)'
                                                    },
                                                }}
                                            />
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <Typography variant="body1" color="textSecondary" fontWeight="medium">
                                                Tên
                                            </Typography>
                                            <TextField
                                                variant="outlined"
                                                size="small"
                                                fullWidth
                                                value={patientInfo.firstName}
                                                disabled
                                                sx={{
                                                    mt: 1,
                                                    "& .MuiOutlinedInput-root": {
                                                        borderRadius: 2,
                                                        bgcolor: 'rgba(0, 0, 0, 0.02)'
                                                    },
                                                }}
                                            />
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <Typography variant="body1" color="textSecondary" fontWeight="medium">
                                                Ngày sinh
                                            </Typography>
                                            <TextField
                                                variant="outlined"
                                                size="small"
                                                fullWidth
                                                value={new Date(patientInfo.dateOfBirth).toLocaleDateString('vi-VN')}
                                                disabled
                                                sx={{
                                                    mt: 1,
                                                    "& .MuiOutlinedInput-root": {
                                                        borderRadius: 2,
                                                        bgcolor: 'rgba(0, 0, 0, 0.02)'
                                                    },
                                                }}
                                            />
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <Typography variant="body1" color="textSecondary" fontWeight="medium">
                                                Giới tính
                                            </Typography>
                                            <TextField
                                                variant="outlined"
                                                size="small"
                                                fullWidth
                                                value={patientInfo.gender}
                                                disabled
                                                sx={{
                                                    mt: 1,
                                                    "& .MuiOutlinedInput-root": {
                                                        borderRadius: 2,
                                                        bgcolor: 'rgba(0, 0, 0, 0.02)'
                                                    },
                                                }}
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Typography variant="body1" color="textSecondary" fontWeight="medium">
                                                Số điện thoại
                                            </Typography>
                                            <TextField
                                                variant="outlined"
                                                size="small"
                                                fullWidth
                                                value={patientInfo.phoneNumber}
                                                disabled
                                                sx={{
                                                    mt: 1,
                                                    "& .MuiOutlinedInput-root": {
                                                        borderRadius: 2,
                                                        bgcolor: 'rgba(0, 0, 0, 0.02)'
                                                    },
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{
                        width: '100%',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        borderRadius: '8px',
                        '& .MuiAlert-icon': {
                            fontSize: '24px'
                        }
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Image Modal */}
            <Modal
                open={openImageModal}
                onClose={handleCloseImage}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                    sx: { backdropFilter: "blur(8px)" },
                }}
            >
                <Fade in={openImageModal}>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            maxWidth: '90vw',
                            maxHeight: '90vh',
                            outline: 'none',
                            p: 1,
                            bgcolor: 'background.paper',
                            borderRadius: 3,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                        }}
                    >
                        <IconButton
                            onClick={handleCloseImage}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: 8,
                                bgcolor: 'rgba(255, 255, 255, 0.8)',
                                '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                                },
                                zIndex: 1,
                            }}
                        >
                            <Close />
                        </IconButton>
                        <Box
                            component="img"
                            src={avatarUrl}
                            alt="Profile"
                            sx={{
                                maxWidth: '100%',
                                maxHeight: '85vh',
                                objectFit: 'contain',
                                borderRadius: 2,
                                display: 'block',
                            }}
                        />
                    </Box>
                </Fade>
            </Modal>

            {/* Edit Profile Modal */}
            <Modal
                open={openEdit}
                onClose={handleCloseEdit}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                    sx: { backdropFilter: "blur(5px)" },
                }}
            >
                <Fade in={openEdit}>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '90%',
                            maxWidth: 600,
                            bgcolor: 'background.paper',
                            borderRadius: 3,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                            p: 4,
                        }}
                    >
                        <Typography variant="h6" color="#027FC1" fontWeight="bold" mb={3}>
                            Chỉnh sửa thông tin cá nhân
                        </Typography>

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="body2" color="textSecondary" mb={1}>
                                    Họ
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    value={editForm.lastName}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 2,
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography variant="body2" color="textSecondary" mb={1}>
                                    Tên
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    value={editForm.firstName}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 2,
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography variant="body2" color="textSecondary" mb={1}>
                                    Ngày sinh
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="date"
                                    value={editForm.dateOfBirth}
                                    onChange={(e) => setEditForm(prev => ({
                                        ...prev,
                                        dateOfBirth: e.target.value
                                    }))}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 2,
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography variant="body2" color="textSecondary" mb={1}>
                                    Giới tính
                                </Typography>
                                <Select
                                    fullWidth
                                    size="small"
                                    value={editForm.gender}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, gender: e.target.value }))}
                                    sx={{
                                        borderRadius: 2,
                                    }}
                                >
                                    <MenuItem value="Male">Nam</MenuItem>
                                    <MenuItem value="Female">Nữ</MenuItem>
                                    <MenuItem value="Other">Khác</MenuItem>
                                </Select>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="body2" color="textSecondary" mb={1}>
                                    Số điện thoại
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    value={editForm.phoneNumber}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 2,
                                        },
                                    }}
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button
                                variant="outlined"
                                onClick={handleCloseEdit}
                                sx={{
                                    borderRadius: 2,
                                    borderColor: '#027FC1',
                                    color: '#027FC1',
                                    '&:hover': {
                                        borderColor: '#1B9DF0',
                                        bgcolor: 'rgba(27, 157, 240, 0.04)',
                                    },
                                }}
                            >
                                Hủy
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleUpdateProfile}
                                sx={{
                                    borderRadius: 2,
                                    bgcolor: '#027FC1',
                                    '&:hover': {
                                        bgcolor: '#1B9DF0',
                                    },
                                }}
                            >
                                Lưu thay đổi
                            </Button>
                        </Box>
                    </Box>
                </Fade>
            </Modal>
        </>
    );
};

export default Frame;