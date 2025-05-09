import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  CircularProgress,
  Typography,
  TextField,
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import styles from './AccountManagement.module.css';
import { getAllAccount } from '../../../api/Account/Account';

interface Account {
  accountId: string;
  accountName: string;
  email: string;
  roleId: string;
  isDisabled: string;
  createdAt: string;
}

const AccountManagementPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    filterAccounts();
  }, [searchTerm, selectedRole, accounts]);

  const filterAccounts = () => {
    let filtered = [...accounts];

    if (selectedRole !== 'all') {
      filtered = filtered.filter(account => account.roleId === selectedRole);
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(account =>
        account.accountName.toLowerCase().includes(searchLower) ||
        account.email.toLowerCase().includes(searchLower)
      );
    }

    setFilteredAccounts(filtered);
    setPage(0);
  };

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await getAllAccount();
      if (response.statusCode === 200) {
        setAccounts(response.result);
      } else {
        setError('Failed to fetch accounts');
      }
    } catch (err) {
      setError('Error fetching accounts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const currentAccounts = filteredAccounts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getRoleName = (roleId: string) => {
    switch (roleId) {
      case 'ad':
        return 'Admin';
      case 'doc':
        return 'Doctor';
      case 'seeker':
        return 'Seeker';
      default:
        return roleId;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <Typography color="error">{error}</Typography>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Typography className={styles.title}>
        Account Management
      </Typography>

      <Box className={styles.controls}>
        <Box className={styles.searchBox}>
          <SearchIcon className={styles.searchIcon} />
          <TextField
            placeholder="Search by username or email..."
            variant="standard"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
            fullWidth
            InputProps={{
              disableUnderline: true,
            }}
          />
        </Box>

        <FormControl className={styles.roleFilter}>
          <InputLabel>Role</InputLabel>
          <Select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            label="Role"
          >
            <MenuItem value="all">All Roles</MenuItem>
            <MenuItem value="ad">Admin</MenuItem>
            <MenuItem value="doc">Doctor</MenuItem>
            <MenuItem value="seeker">Seeker</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper} className={styles.tableContainer}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell className={styles.tableHeader}>Account ID</TableCell>
              <TableCell className={styles.tableHeader}>Username</TableCell>
              <TableCell className={styles.tableHeader}>Email</TableCell>
              <TableCell className={styles.tableHeader}>Role</TableCell>
              <TableCell className={styles.tableHeader}>Status</TableCell>
              <TableCell className={styles.tableHeader}>Created At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentAccounts.map((account) => (
              <TableRow
                key={account.accountId}
                className={styles.tableRow}
              >
                <TableCell>{account.accountId}</TableCell>
                <TableCell>{account.accountName}</TableCell>
                <TableCell>{account.email}</TableCell>
                <TableCell>
                  <span className={`${styles.roleChip} ${styles[account.roleId]}`}>
                    {getRoleName(account.roleId)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`${styles.statusChip} ${account.isDisabled ? styles.inactive : styles.active}`}>
                    {account.isDisabled ? 'Inactive' : 'Active'}
                  </span>
                </TableCell>
                <TableCell>{formatDate(account.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredAccounts.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[10]}
      />
    </div>
  );
};

export default AccountManagementPage;