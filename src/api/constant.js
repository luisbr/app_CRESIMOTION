import images from "../assets/images";
import {
  AppointmentIcon,
  BulkPaperIcon,
  ChangePassDarkIcon,
  ChangePassLightIcon,
  CovidIcon,
  DarkModeDarkIcon,
  DarkModeLightIcon,
  DentalIcon,
  DiabetesIcon,
  FileIcon,
  ForgotPassDarkIcon,
  ForgotPassLightIcon,
  HeartCareIcon,
  HelpSupportDarkIcon,
  HelpSupportLightIcon,
  HospitalIcon,
  InsuredIcon,
  LanguageDarkIcon,
  LanguageLightIcon,
  LegalPrivacyDarkIcon,
  LegalPrivacyLightIcon,
  LocationDarkIcon,
  LocationIcon,
  LocationLightIcon,
  MasterCardIcon,
  MoreIcon,
  NotificationDarkIcon,
  NotificationLightIcon,
  PaymentDarkIcon,
  PaymentLightIcon,
  PharmacyIcon,
  VisaIcon,
} from "../assets/svg";
import { moderateScale } from "../common/constants";
import strings from "../i18n/strings";
import { StackNav } from "../navigation/NavigationKey";

export const OnBoardingData = [
  {
    id: 1,
    image: images.onBoardingImage1,
  },
  {
    id: 2,
    image: images.onBoardingImage2,
  },
  {
    id: 3,
    image: images.onBoardingImage3,
  },
  {
    id: 4,
    image: images.onBoardingImage1,
  },
  {
    id: 5,
    image: images.onBoardingImage2,
  },
];

export const HealthNeedsData = [
  {
    id: 1,
    icon: <AppointmentIcon />,
    title: strings.appointment,
  },
  {
    id: 2,
    icon: <HospitalIcon />,
    title: strings.hospital,
  },
  {
    id: 3,
    icon: <CovidIcon />,
    title: strings.covid,
  },
  {
    id: 4,
    icon: <MoreIcon />,
    title: strings.more,
  },
];

export const HealthNeedMoreData = [
  {
    id: 1,
    icon: <AppointmentIcon />,
    title: strings.appointment,
  },
  {
    id: 2,
    icon: <HospitalIcon />,
    title: strings.hospital,
  },
  {
    id: 3,
    icon: <CovidIcon />,
    title: strings.covid,
  },
  {
    id: 4,
    icon: <PharmacyIcon />,
    title: strings.pharmacy,
  },

  {
    id: 5,
    icon: <DiabetesIcon />,
    title: strings.diabetes,
  },
  {
    id: 6,
    icon: <HeartCareIcon />,
    title: strings.heartCare,
  },
  {
    id: 7,
    icon: <DentalIcon />,
    title: strings.dental,
  },
  {
    id: 8,
    icon: <InsuredIcon />,
    title: strings.insured,
  },
];

export const NearbyDoctorsData = [
  {
    id: 1,
    image: images.DrProfileImage2,
    drName: "Dr. Skylar Korsgaard",
    specialist: strings.generalPractitioner,
    rate: "4.0",
    review: "(191 Reviews)",
  },
  {
    id: 2,
    image: images.DrProfileImage3,
    drName: "Dr. Adison Schleifer",
    specialist: strings.generalPractitioner,
    rate: "4.0",
    review: "(196 Reviews)",
    rate: "4.0",
    review: "(191 Reviews)",
  },
  {
    id: 3,
    image: images.DrProfileImage1,
    drName: "Dr. Ruben Dorwart",
    specialist: strings.dentalSpecialist,
    rate: "4.0",
    review: "(191 Reviews)",
  },
  {
    id: 4,
    image: images.DrProfileImage4,
    drName: "Dr. Adison Schleifer",
    specialist: strings.generalPractitioner,
    rate: "4.0",
    review: "(191 Reviews)",
  },
];

export const MessageData = [
  {
    id: 1,
    image: images.UserImage1,
    userName: "Esther Howard",
    message: "Lorem ipsum dolor sit amet...",
    time: "10:20",
    pendingMsg: "2",
    isOnline: true,
  },
  {
    id: 2,
    image: images.UserImage2,
    userName: "Wade Warren",
    message: "Lorem ipsum dolor sit amet...",
    time: "10:20",
    pendingMsg: "2",
  },
  {
    id: 3,
    image: images.UserImage3,
    userName: "Chance Septimus",
    message: "Lorem ipsum dolor sit amet...",
    time: "10:20",
  },
  {
    id: 4,
    image: images.UserImage4,
    userName: "Robert Fox",
    message: "Lorem ipsum dolor sit amet...",
    time: "10:20",
  },
];

export const PaymentMethodData = [
  {
    id: 1,
    icon: <VisaIcon />,
    cardNumber: "•••• •••• •••• 87652",
  }
];

export const WaitingRoomData = [
  {
    id: 1,
    title: strings.fillTheFormForInquires,
    icon: <FileIcon />,
  },
  {
    id: 2,
    title: strings.insuranceInclude,
    icon: <BulkPaperIcon />,
  },
  {
    id: 3,
    title: strings.currentLocation,
    icon: <LocationIcon />,
  },
];

export const ChatData = [
  {
    id: 1,
    message: "Lorem ipsum dolor sit et, consectetur adipiscing.",
    type: "receiver",
    time: "Jul 19, 2022",
  },
  {
    id: 2,
    message: "Lorem ipsum dolor sit et, consectetur adipiscing.",
    type: "receiver",
    time: "Jul 19, 2022",
  },
  {
    id: 3,
    message: "Lorem ipsum dolor sit et, consectetur adipiscing.",
    type: "sender",
    time: "Jul 19, 2022",
  },
];

export const NotificationData = [
  {
    title: strings.today,
    data: [
      {
        id: 1,
        image: images.DrProfileImage1,
        desc: "dr. Chance Septimus just Approved for the appointment on 22nd June 2022 at 03.00 PM ",
        time: "2 hours Ago",
      },
      {
        id: 2,
        image: images.DrProfileImage1,
        desc: "dr. Chance Septimus Replayed your message .",
        time: "2 hours Ago",
      },
      {
        id: 3,
        desc: "Be Ready, Your appointment will be held after 2 minutes !",
        time: "2 hours Ago",
        icon: true,
      },
    ],
  },
  {
    title: strings.yesterday,
    data: [
      {
        id: 1,
        image: images.DrProfileImage1,
        desc: "dr. Chance Septimus just Approved for the appointment on 22nd June 2022 at 03.00 PM ",
        time: "2 hours Ago",
      },
      {
        id: 2,
        image: images.DrProfileImage1,
        desc: "dr. Chance Septimus Replayed your message .",
        time: "2 hours Ago",
      },
      {
        id: 3,
        desc: "Be Ready, Your appointment will be held after 2 minutes !",
        time: "2 hours Ago",
        icon: true,
      },
    ],
  },
];

export const PersonalData = [
  {
    id: 1,
    title: strings.age,
    value: "24 years",
  },
  {
    id: 2,
    title: strings.height,
    value: "165 cm",
  },
  {
    id: 3,
    title: strings.weight,
    value: "56 kg",
  },
];

export const ProfileData = [
  {
    header: strings.personalInfo,
    data: [
      {
        id: 2,
        darkIcon: <PaymentDarkIcon />,
        lightIcon: <PaymentLightIcon />,
        title: strings.paymentMethod,
        route: StackNav.MyPayment,
      },
    ],
  },
  {
    header: strings.security,
    data: [
      {
        id: 3,
        darkIcon: <ChangePassDarkIcon />,
        lightIcon: <ChangePassLightIcon />,
        title: strings.changePassword,
      },
      
      {
        id: 5,
        darkIcon: <DarkModeDarkIcon />,
        lightIcon: <DarkModeLightIcon />,
        title: strings.darkMode,
        switch: true,
      },
    ],
  },
  {
    header: strings.general,
    data: [
      {
        id: 6,
        darkIcon: <NotificationDarkIcon />,
        lightIcon: <NotificationLightIcon />,
        title: strings.notification,
      },
      {
        id: 7,
        darkIcon: <LanguageDarkIcon />,
        lightIcon: <LanguageLightIcon />,
        title: strings.languages,
        route: StackNav.Languages,
      },
      {
        id: 8,
        darkIcon: <HelpSupportDarkIcon />,
        lightIcon: <HelpSupportLightIcon />,
        title: strings.helpAndSupport,
        route: StackNav.HelpAndSupport,
      },
    ],
  },
];

export const MyAddressData = [
  {
    id: 1,
    title: "Brooklyn Simmons",
    phoneNo: "+1 3712 3789",
    address: "711 Leavenworth Apt. # 47 San Francisco, CA 94109",
  },
  {
    id: 2,
    title: "Brooklyn Simmons",
    phoneNo: "+1 3712 3789",
    address: "711 Leavenworth Apt. # 47 San Francisco, CA 94109",
  },
];

export const CountryData = [
  {
    label: "India",
    value: "India",
  },
  {
    label: "US",
    value: "US",
  },
  {
    label: "Canada",
    value: "Canada",
  },
  {
    label: "China",
    value: "China",
  },
  {
    label: "Japan",
    value: "Japan",
  },
  {
    label: "Korea",
    value: "Korea",
  },
  {
    label: "Afghanistan",
    value: "Afghanistan",
  },
  {
    label: "Andorra",
    value: "Andorra",
  },
  {
    label: "Belgium",
    value: "Belgium",
  },
  {
    label: "New Zealand",
    value: "New Zealand",
  },
  {
    label: "Oman",
    value: "Oman",
  },
  {
    label: "Colombia",
    value: "Colombia",
  },
  {
    label: "Portugal",
    value: "Portugal",
  },
  {
    label: "Qatar",
    value: "Qatar",
  },
  {
    label: "Dominica",
    value: "Dominica",
  },
  {
    label: "Russia",
    value: "Russia",
  },
  {
    label: "San Marino",
    value: "San Marino",
  },
  {
    label: "Eritrea",
    value: "Eritrea",
  },
  {
    label: "Singapore",
    value: "Singapore",
  },
  {
    label: "Georgia",
    value: "Georgia",
  },
];

export const CityData = [
  {
    label: "Surat",
    value: "Surat",
  },
  {
    label: "Amritsar",
    value: "Amritsar",
  },
  {
    label: "Kolkata",
    value: "Kolkata",
  },
  {
    label: "Bangalore",
    value: "Bangalore",
  },
  {
    label: "Kozhikode",
    value: "Kozhikode",
  },
  {
    label: "Manhattan",
    value: "Manhattan",
  },
  {
    label: "Chandigarh",
    value: "Chandigarh",
  },
  {
    label: "Diu",
    value: "Diu",
  },
  {
    label: "Delhi",
    value: "Delhi",
  },
  {
    label: "Ahmadabad",
    value: "Ahmadabad",
  },
  {
    label: "Dwarka",
    value: "Dwarka",
  },
  {
    label: "Junagadh",
    value: "Junagadh",
  },
  {
    label: "Okha",
    value: "Okha",
  },
  {
    label: "Chennai",
    value: "Chennai",
  },
];

export const StateData = [
  {
    label: "Andhra Pradesh",
    value: "Andhra Pradesh",
  },
  {
    label: "Assam",
    value: "Assam",
  },
  {
    label: "Kerala",
    value: "Kerala",
  },
  {
    label: "Madhya Pradesh",
    value: "Madhya Pradesh",
  },
  {
    label: "Gujarat",
    value: "Gujarat",
  },
  {
    label: "Ladakh",
    value: "Ladakh",
  },
  {
    label: "Odisha",
    value: "Odisha",
  },
  {
    label: "Puducherry ",
    value: "Puducherry ",
  },
  {
    label: "Punjab",
    value: "Punjab",
  },
  {
    label: "Rajasthan",
    value: "Rajasthan",
  },
  {
    label: "Meghalaya",
    value: "Meghalaya",
  },
  {
    label: "Maharashtra",
    value: "Maharashtra",
  },
  {
    label: "Uttar Pradesh",
    value: "Uttar Pradesh",
  },
  {
    label: "West Bengal",
    value: "West Bengal",
  },
];

export const MyPaymentData = [
  {
    id: 1,
    title: "BCA (Bank Central Asia)",
    cardNo: "•••• •••• •••• 87652",
    holderName: "Brooklyn Simmons",
    icon: <VisaIcon height={moderateScale(10)} width={moderateScale(32)} />,
  },
  {
    id: 2,
    title: "BCA (Bank Central Asia)",
    cardNo: "•••• •••• •••• 87652",
    holderName: "Brooklyn Simmons",
    icon: (
      <MasterCardIcon height={moderateScale(24)} width={moderateScale(32)} />
    ),
  },
];

export const HelpAndSupportData = [
  {
    id: 1,
    title: "Lorem ipsum dolor sit amet",
    desc: "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.",
  },
  {
    id: 2,
    title: "Lorem ipsum dolor sit amet",
    desc: "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.",
  },
  {
    id: 3,
    title: "Lorem ipsum dolor sit amet",
    desc: "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.",
  },
  {
    id: 4,
    title: "Lorem ipsum dolor sit amet",
    desc: "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.",
  },
  {
    id: 5,
    title: "Lorem ipsum dolor sit amet",
    desc: "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.",
  },
];

export const LanguagesData = [
  {
    title: strings.suggestedLanguages,
    data: [
      {
        id: 1,
        lnName: "English (UK)",
      },
      {
        id: 2,
        lnName: "English",
      },
      {
        id: 3,
        lnName: "Bahasa Indonesia",
      },
    ],
  },
  {
    title: strings.otherLanguages,
    data: [
      {
        id: 4,
        lnName: "Chineses",
      },
      {
        id: 5,
        lnName: "Croatian",
      },
      {
        id: 6,
        lnName: "Czech",
      },
      {
        id: 7,
        lnName: "Danish",
      },
      {
        id: 8,
        lnName: "Filipino",
      },
    ],
  },
];
