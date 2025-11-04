import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import CHeader from '../../components/common/CHeader';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import { styles } from '../../theme';

export default function HealingStartScreen({ navigation }: any) {
  const colors = useSelector((s: any) => s.theme.theme);
  const [checks, setChecks] = useState({ a: false, b: false, c: false, d: false });
  const allSelected = checks.a && checks.b && checks.c && checks.d;

  return (
    <CSafeAreaView>
      <CHeader title={'Inicio de proceso de sanación'} />
      <ScrollView contentContainerStyle={[styles.ph20, styles.pv20, { paddingBottom: 120 }]}
                  keyboardShouldPersistTaps={'handled'}>
        <CText type={'R16'} color={colors.textColor}>
          A partir de este momento, inicias tu proceso de sanación. Para aprovechar al máximo las siguientes dos fases (Enfoque positivo y Sanación emocional), confirma, por favor, que reúnes las siguientes condiciones:
        </CText>

        <View style={[styles.mt20]}>
          {[{ key: 'a', label: 'Dispongo de al menos media hora para estar a solas, en un lugar tranquilo, libre de ruidos excesivos, distracciones o interrupciones externas, dedicando toda la atención a mi salud emocional.' }, 
            { key: 'b', label: 'Cuento con una óptima conexión a internet para evitar interrupciones.' },
            { key: 'c', label: 'Me encuentro en un espacio cómodo donde puedo recostarme o relajarme completamente.' },
            { key: 'd', label: 'He entendido estas recomendaciones. No volver a mostrar.' }
          
          ].map((opt, idx) => {
            const isOn = (checks as any)[opt.key];
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setChecks(s => ({ ...s, [opt.key]: !((s as any)[opt.key]) }) as any)}
                style={[styles.rowSpaceBetween, styles.pv15, idx > 0 ? { marginTop: 4 } : null]}
              >
                <CText type={'S16'} style={{ flex: 1, marginRight: 12 }}>{opt.label}</CText>
                <View
                  style={{
                    width: 22, height: 22, borderRadius: 11,
                    borderWidth: 2, borderColor: isOn ? colors.primary : colors.grayScale2,
                    backgroundColor: isOn ? colors.primary : 'transparent',
                  }}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[styles.mt30, styles.rowSpaceBetween]}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <CButton title={'Más tarde'} bgColor={colors.inputBg} color={colors.primary} onPress={() => navigation.navigate('HomeRoot')} />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <CButton title={'Continuar'} disabled={!allSelected} onPress={() => {
              console.log('[HEALING] continuar');
            }} />
          </View>
        </View>
      </ScrollView>
    </CSafeAreaView>
  );
}
