// Library Imports
import React from 'react';
import {KeyboardAvoidingView, ScrollView} from 'react-native';

// Local Imports
import {checkPlatform, isIOS, moderateScale} from '../../common/constants';
import {styles} from '../../theme';

// KeyboardAvoidWrapper Component
const KeyBoardAvoidWrapper = ({
  children,
  containerStyle,
  contentContainerStyle,
}) => {
  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={checkPlatform() === 'ios' ? moderateScale(40) : 0}
      style={[styles.flex, containerStyle]}
      behavior={isIOS ? 'padding' : 'height'}>
      <ScrollView
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          {flexGrow: 1, paddingBottom: moderateScale(24)},
          contentContainerStyle,
        ]}
        bounces={false}>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default KeyBoardAvoidWrapper;
