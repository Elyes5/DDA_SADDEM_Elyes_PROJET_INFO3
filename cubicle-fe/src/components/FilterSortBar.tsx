import React from 'react'
import {
    Box,
    FormControl,
    Select,
    MenuItem,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    Chip,
    type SelectChangeEvent,
} from '@mui/material'
import CodeIcon from '@mui/icons-material/Code'
import SortIcon from '@mui/icons-material/Sort'
import FavoriteIcon from '@mui/icons-material/Favorite'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import NewReleasesIcon from '@mui/icons-material/NewReleases'

const LANGUAGES = [
    'All',
    'JavaScript',
    'TypeScript',
    'Python',
    'Java',
    'C#',
    'C++',
    'C',
    'Go',
    'Rust',
    'PHP',
    'Ruby',
    'Swift',
    'Kotlin',
    'Other',
]

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest', icon: <NewReleasesIcon fontSize="small" /> },
    { value: 'oldest', label: 'Oldest', icon: <AccessTimeIcon fontSize="small" /> },
    { value: 'most_liked', label: 'Top', icon: <FavoriteIcon fontSize="small" /> },
]

interface FilterSortBarProps {
    language: string
    sortBy: string
    onLanguageChange: (lang: string) => void
    onSortChange: (sort: string) => void
}

export const FilterSortBar: React.FC<FilterSortBarProps> = ({
    language,
    sortBy,
    onLanguageChange,
    onSortChange,
}) => {
    const handleLanguageChange = (event: SelectChangeEvent) => {
        onLanguageChange(event.target.value)
    }

    const handleSortChange = (
        _event: React.MouseEvent<HTMLElement>,
        newSort: string | null,
    ) => {
        if (newSort !== null) {
            onSortChange(newSort)
        }
    }

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 4,
                flexWrap: 'wrap',
                p: 2,
                borderRadius: 0.5,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
        >
            {/* Language filter */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CodeIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ whiteSpace: 'nowrap' }}>
                    Language
                </Typography>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                    <Select
                        value={language}
                        onChange={handleLanguageChange}
                        displayEmpty
                        sx={{
                            borderRadius: 2,
                            fontSize: '0.875rem',
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'divider',
                            },
                        }}
                        renderValue={(selected) => (
                            <Chip
                                label={selected === 'All' ? 'All Languages' : selected}
                                size="small"
                                sx={{
                                    height: 22,
                                    fontSize: '0.75rem',
                                    bgcolor: selected !== 'All' ? 'primary.main' : 'action.hover',
                                    color: selected !== 'All' ? 'primary.contrastText' : 'text.primary',
                                    fontWeight: 600,
                                }}
                            />
                        )}
                    >
                        {LANGUAGES.map((lang) => (
                            <MenuItem key={lang} value={lang} sx={{ fontSize: '0.875rem' }}>
                                {lang === 'All' ? 'All Languages' : lang}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Divider */}
            <Box
                sx={{
                    width: '1px',
                    height: 28,
                    bgcolor: 'divider',
                    display: { xs: 'none', sm: 'block' },
                }}
            />

            {/* Sort order */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SortIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ whiteSpace: 'nowrap' }}>
                    Sort by
                </Typography>
                <ToggleButtonGroup
                    value={sortBy}
                    exclusive
                    onChange={handleSortChange}
                    size="small"
                    sx={{
                        '& .MuiToggleButton-root': {
                            px: 1.5,
                            py: 0.5,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            textTransform: 'none',
                            borderRadius: '8px !important',
                            border: '1px solid',
                            borderColor: 'divider',
                            gap: 0.5,
                            '&.Mui-selected': {
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                                borderColor: 'primary.main',
                                '&:hover': {
                                    bgcolor: 'primary.dark',
                                },
                            },
                        },
                        gap: 0.5,
                    }}
                >
                    {SORT_OPTIONS.map((opt) => (
                        <ToggleButton key={opt.value} value={opt.value}>
                            {opt.icon}
                            {opt.label}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Box>
        </Box>
    )
}
