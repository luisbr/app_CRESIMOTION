// app colors
const LightColor = {
  light: 'light',
  backgroundColor: '#FFFFFF',
  textColor: '#171725',
  indicatorColor: '#E3E9ED',
  inputBg: '#e5fffcff',
  dividerColor: '#EBEBF0',
  transparentModel: '#C7C7CA',
  scheduleBg: '#ECF1F6',
  chatActionBg: '#E9EBF1',
};

const DarkColor = {
  dark: 'dark',
  backgroundColor: '#0B0D14',
  textColor: '#FEFEFE',
  indicatorColor: '#1D1D2F',
  inputBg: '#1D1D2F',
  dividerColor: '#282837',
  transparentModel: '#171725',
  iconBorderColor: '#2E2E3B',
  scheduleBg: '#171725',
  chatActionBg: '#292F35',
};

const commonColor = {
  // Brand primary (Blue) and accent (Green)
  primary: '#0aa693',
  grayScale1: '#9CA4AB',
  white: '#FEFEFE',
  secondary: '#F6F8FE',
  secondary2: '#FDFDFD',
  primary2: '#3b5c84',
  borderColor: '#E2E7EB',
  labelColor: '#78828A',
  grayScale2: '#E3E7EC',
  alertColor: '#F2A8A4',
  grayScale3: '#8E8E8E',
  grayScale4: '#BFBFBF',
  ratingStar: '#F0BB52',
  checkMark: '#0aa693',
  verticalLine: '#E2E7EB',
  redAlert: '#EB5757',
  lightRedColor: '#FFF5F5',
  greenDot: '#0aa693',
  chatBgColor: '#F6F8FF',
  gradientColor2: 'rgba(255, 255, 255, 0.2)',
  redColor: '#DE1A10',
  lightPrimary: '#4a6b90',
  shadowColor: '#1717251f',
};

export const colors = {
  light: {
    ...LightColor,
    ...commonColor,
  },
  dark: {
    ...DarkColor,
    ...commonColor,
  },
};
