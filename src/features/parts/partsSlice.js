import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  DEFAULT_API_KEY,
  getManufacturersByNumber,
  getOffersAndAnalogues
} from '../../api/partsApi';

// Асинхронный thunk для Этапа 1: Поиск производителей по артикулу
export const searchBrands = createAsyncThunk(
  'parts/searchBrands',
  async ({ number, key }, { rejectWithValue }) => {
    try {
      const brands = await getManufacturersByNumber(number, key);
      return { number, brands };
    } catch (error) {
      return rejectWithValue(error.message || 'Ошибка при поиске производителей');
    }
  }
);

// Асинхронный thunk для Этапа 2: Получение предложений и аналогов
export const searchOffers = createAsyncThunk(
  'parts/searchOffers',
  async ({ number, brand, key }, { rejectWithValue }) => {
    try {
      const offers = await getOffersAndAnalogues(number, brand, key);
      return { number, brand, offers };
    } catch (error) {
      return rejectWithValue(error.message || 'Ошибка при получении предложений и аналогов');
    }
  }
);

const initialState = {
  apiKey: DEFAULT_API_KEY,
  articleQuery: '',
  selectedBrand: null,
  currentStep: 1, // 1: Поиск производителей, 2: Предложения и аналоги
  
  // Данные Этапа 1
  brands: [],
  brandsStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  brandsError: null,
  searchedNumber: '',
  
  // Данные Этапа 2
  offers: [],
  offersStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  offersError: null,
  
  // История последних поисков
  recentSearches: ['01089', '7160500039S', '0189']
};

const partsSlice = createSlice({
  name: 'parts',
  initialState,
  reducers: {
    setApiKey: (state, action) => {
      state.apiKey = action.payload ? action.payload.trim() : DEFAULT_API_KEY;
    },
    resetApiKey: (state) => {
      state.apiKey = DEFAULT_API_KEY;
    },
    setArticleQuery: (state, action) => {
      state.articleQuery = action.payload;
    },
    setSelectedBrand: (state, action) => {
      state.selectedBrand = action.payload;
    },
    goToStep: (state, action) => {
      state.currentStep = action.payload;
    },
    resetAll: (state) => {
      state.articleQuery = '';
      state.selectedBrand = null;
      state.currentStep = 1;
      state.brands = [];
      state.brandsStatus = 'idle';
      state.brandsError = null;
      state.searchedNumber = '';
      state.offers = [];
      state.offersStatus = 'idle';
      state.offersError = null;
    },
    clearErrors: (state) => {
      state.brandsError = null;
      state.offersError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Поиск производителей (Этап 1)
      .addCase(searchBrands.pending, (state, action) => {
        state.brandsStatus = 'loading';
        state.brandsError = null;
        state.brands = [];
        state.searchedNumber = action.meta.arg.number;
        state.selectedBrand = null;
        state.offers = [];
        state.offersStatus = 'idle';
        state.offersError = null;
        state.currentStep = 1;
      })
      .addCase(searchBrands.fulfilled, (state, action) => {
        state.brandsStatus = 'succeeded';
        state.brands = action.payload.brands;
        state.searchedNumber = action.payload.number;
        
        // Добавляем артикул в историю поисков без дубликатов
        const num = action.payload.number.trim();
        if (num && !state.recentSearches.includes(num)) {
          state.recentSearches = [num, ...state.recentSearches.slice(0, 4)];
        }
      })
      .addCase(searchBrands.rejected, (state, action) => {
        state.brandsStatus = 'failed';
        state.brandsError = action.payload || 'Произошла ошибка при обращении к API';
      })
      
      // Поиск предложений и аналогов (Этап 2)
      .addCase(searchOffers.pending, (state, action) => {
        state.offersStatus = 'loading';
        state.offersError = null;
        state.offers = [];
        state.selectedBrand = action.meta.arg.brand;
        state.currentStep = 2; // Автоматически переходим на шаг 2 при выборе производителя
      })
      .addCase(searchOffers.fulfilled, (state, action) => {
        state.offersStatus = 'succeeded';
        state.offers = action.payload.offers;
      })
      .addCase(searchOffers.rejected, (state, action) => {
        state.offersStatus = 'failed';
        state.offersError = action.payload || 'Произошла ошибка при загрузке аналогов';
      });
  }
});

export const {
  setApiKey,
  resetApiKey,
  setArticleQuery,
  setSelectedBrand,
  goToStep,
  resetAll,
  clearErrors
} = partsSlice.actions;

export default partsSlice.reducer;
