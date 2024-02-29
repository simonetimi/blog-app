'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Logout from '@mui/icons-material/Logout';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UserMenu({ username }: { username: string }) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // handle avatar color
  function stringToColor(string: string) {
    let hash = 0;
    let i;
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
  }

  function stringAvatar(name: string) {
    const parts = name.split(' ');
    const children = `${parts[0][0]}${parts.length > 1 && parts[1] ? parts[1][0] : ''}`;
    return {
      sx: {
        bgcolor: stringToColor(name),
        width: 40,
        height: 40,
      },
      children: children,
    };
  }

  // handle logout
  const onLogout = async () => {
    handleClose();
    toast.dismiss();
    toast.loading('Logging out...');
    try {
      const response = await axios.get('/api/users/logout');
      if (response.status === 200) {
        toast.dismiss();
        toast.success('Logged out!');
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data.error || 'An error occured. Please try again.';
        toast.error(message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  // handle render depending on the presence of a session in the cookie
  const [isSession, setIsSession] = useState(false);
  useEffect(() => {
    if (username && username !== '') {
      setIsSession(true);
    } else {
      setIsSession(false);
    }
  }, [username]);

  const usernameInitial = username.charAt(0).toUpperCase();

  if (!isSession) {
    return (
      <Link
        href="/login"
        className="w-30 flex h-9 items-center justify-center rounded-md border border-white bg-black p-4 text-sm text-white hover:bg-white hover:text-black active:translate-y-1"
      />
    );
  }

  return (
    <nav className="ml-auto">
      <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
        <Tooltip title="Account settings">
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <Avatar {...stringAvatar(`${'username'}`)}>
              {usernameInitial}
            </Avatar>
          </IconButton>
        </Tooltip>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleClose}>
          <Link href={`/blog/user/${username}`} className="flex items-center">
            <Avatar /> Profile
          </Link>
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <ManageAccountsIcon fontSize="small" />
          </ListItemIcon>
          <Link href={`/blog/user/`}>My account</Link>
        </MenuItem>
        <Divider />
        <MenuItem onClick={onLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </nav>
  );
}
