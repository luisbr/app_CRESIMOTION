import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {memo, useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';

// custom imports
import CSafeAreaView from '../../components/common/CSafeAreaView';
import CHeader from '../../components/common/CHeader';
import {checkPlatform, moderateScale} from '../../common/constants';
import {useSelector} from 'react-redux';
import {styles} from '../../theme';
import {ChatData} from '../../api/constant';
import CText from '../../components/common/CText';
import images from '../../assets/images';
import CInput from '../../components/common/CInput';
import strings from '../../i18n/strings';
import {StackNav} from '../../navigation/NavigationKey';

export default function Chat({route, navigation}) {
  const items = route?.params?.item;
  const colors = useSelector(state => state.theme.theme);
  const [chat, setChat] = useState(ChatData);
  const [addChat, setAddChat] = useState('');
  const [chatAction, setChatAction] = useState(false);

  const onchangeComment = text => setAddChat(text);

  const onPressRightIcon = () => {
    setChatAction(!chatAction);
  };

  const onPressVideoCall = () => {
    navigation.navigate(StackNav.VideoCall);
  };
  const HeaderRightIcon = () => {
    return (
      <View>
        <TouchableOpacity
          onPress={onPressRightIcon}
          style={[
            localStyles.iconContainer,
            {
              borderColor: colors.dark
                ? colors.iconBorderColor
                : colors.grayScale2,
            },
          ]}>
          <Ionicons
            name={'ellipsis-vertical'}
            color={colors.textColor}
            size={moderateScale(24)}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const LeftIcon = () => {
    return (
      <View style={localStyles.attachRoot}>
        <TouchableOpacity
          style={[
            localStyles.attachContainer,
            {
              backgroundColor: colors.light && colors.backgroundColor,
            },
          ]}>
          <Feather
            name={'paperclip'}
            color={colors.primary}
            size={moderateScale(24)}
          />
        </TouchableOpacity>
        <View
          style={[
            localStyles.lineView,
            {
              backgroundColor: colors.dark
                ? colors.dividerColor
                : colors.verticalLine,
            },
          ]}
        />
      </View>
    );
  };

  const RightIcon = () => {
    return (
      <TouchableOpacity
        style={[
          localStyles.muteContainer,
          {
            backgroundColor: colors.primary,
          },
        ]}>
        <Icons
          name={'microphone'}
          color={colors.white}
          size={moderateScale(24)}
        />
      </TouchableOpacity>
    );
  };

  const ChatActionComponent = ({title, icon, onPress}) => {
    return (
      <TouchableOpacity style={localStyles.actionInnerRoot} onPress={onPress}>
        <Ionicons
          name={icon}
          size={moderateScale(18)}
          color={colors.textColor}
        />
        <CText type={'M14'}>{title}</CText>
      </TouchableOpacity>
    );
  };
  const SenderMessage = memo(({item, index}) => {
    return (
      <View>
        <View style={localStyles.chatContainer}>
          {item.type === 'receiver' && (
            <View style={styles.selfStart}>
              <Image
                source={images.DrProfileImage}
                style={localStyles.imageStyle}
              />
              <View
                style={[
                  localStyles.dotStyle,
                  {
                    borderColor: colors.white,
                    backgroundColor: colors.greenDot,
                  },
                ]}
              />
            </View>
          )}
          <View
            style={[
              localStyles.senderContainer,
              {
                backgroundColor:
                  item.type == 'sender'
                    ? colors.primary
                    : colors.dark
                    ? colors.indicatorColor
                    : colors.chatBgColor,
                borderTopRightRadius:
                  item.type === 'sender' ? moderateScale(0) : moderateScale(16),
                borderTopLeftRadius:
                  item.type === 'receiver'
                    ? moderateScale(0)
                    : moderateScale(16),
              },
            ]}>
            <CText
              color={item.type === 'sender' ? colors.white : colors.textColor}
              type="M14">
              {item.message}
            </CText>
          </View>
          {item.type === 'sender' && (
            <View style={styles.selfStart}>
              <Image source={items.image} style={localStyles.imageStyle} />
              <View
                style={[
                  localStyles.dotStyle,
                  {
                    borderColor: colors.white,
                    backgroundColor: colors.greenDot,
                  },
                ]}
              />
            </View>
          )}
        </View>
        {item.time && (
          <CText
            color={colors.grayScale1}
            style={styles.mt8}
            type="M12"
            align={item.type === 'sender' ? 'left' : 'right'}>
            {item.time}
          </CText>
        )}
      </View>
    );
  });
  return (
    <CSafeAreaView color={colors.white && 'null'}>
      <View>
        <CHeader
          title={'dr. Chance Septimus'}
          rightAccessory={<HeaderRightIcon />}
          textStyle={styles.center}
        />
        {chatAction === true && (
          <View
            style={[
              localStyles.chatActionContainer,
              {
                backgroundColor: colors.dark
                  ? colors.chatActionBg
                  : colors.backgroundColor,
              },
            ]}>
            <ChatActionComponent
              title={strings.voiceCall}
              icon={'call-outline'}
            />
            <ChatActionComponent
              title={strings.videoCall}
              icon={'videocam-outline'}
              onPress={onPressVideoCall}
            />
          </View>
        )}
      </View>
      <KeyboardAvoidingView
        keyboardVerticalOffset={
          checkPlatform() === 'ios' ? moderateScale(10) : null
        }
        style={localStyles.mainContainer}
        behavior={checkPlatform() === 'ios' ? 'padding' : null}>
        <FlatList
          data={chat}
          renderItem={({item, index}) => (
            <SenderMessage item={item} index={index} />
          )}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.g30}
          showsVerticalScrollIndicator={false}
        />

        <CInput
          placeHolder={strings.message}
          keyBoardType={'default'}
          _value={addChat}
          autoCapitalize={'none'}
          toGetTextFieldValue={onchangeComment}
          inputContainerStyle={localStyles.inputContainerStyle}
          insideLeftIcon={LeftIcon}
          rightAccessory={RightIcon}
        />
      </KeyboardAvoidingView>
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  mainContainer: {
    ...styles.flex,
    ...styles.justifyBetween,
    ...styles.p20,
  },
  iconContainer: {
    height: moderateScale(48),
    width: moderateScale(48),
    borderRadius: moderateScale(24),
    borderWidth: moderateScale(1),
    ...styles.center,
  },
  chatContainer: {
    ...styles.g12,
    ...styles.flexRow,
  },
  senderContainer: {
    ...styles.p15,
    ...styles.flexRow,
    borderRadius: moderateScale(16),
    ...styles.itemsEnd,
  },
  imageStyle: {
    height: moderateScale(32),
    width: moderateScale(32),
    borderRadius: moderateScale(40),
  },
  dotStyle: {
    height: moderateScale(8),
    width: moderateScale(8),
    borderRadius: moderateScale(4),
    borderWidth: moderateScale(1),
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  attachContainer: {
    height: moderateScale(32),
    width: moderateScale(32),
    borderRadius: moderateScale(16),
    ...styles.center,
  },
  attachRoot: {
    ...styles.flexRow,
    ...styles.g10,
    ...styles.itemsCenter,
  },
  lineView: {
    height: moderateScale(18),
    width: moderateScale(1),
    ...styles.mr5,
  },
  muteContainer: {
    height: moderateScale(42),
    width: moderateScale(42),
    borderRadius: moderateScale(21),
    ...styles.center,
  },
  inputContainerStyle: {
    ...styles.ph0,
    ...styles.pl10,
  },
  chatActionContainer: {
    ...styles.p15,
    borderRadius: moderateScale(8),
    position: 'absolute',
    right: moderateScale(53),
    top: moderateScale(35),
    ...styles.g12,
    zIndex: 1,
  },
  actionInnerRoot: {
    ...styles.flexRow,
    ...styles.g2,
  },
});
