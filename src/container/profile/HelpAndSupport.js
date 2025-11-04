import { FlatList, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";

// custom import
import CSafeAreaView from "../../components/common/CSafeAreaView";
import CHeader from "../../components/common/CHeader";
import strings from "../../i18n/strings";
import { HelpAndSupportData } from "../../api/constant";
import KeyBoardAvoidWrapper from "../../components/common/KeyBoardAvoidWrapper";
import SearchComponent from "../../components/home/searchComponent";
import HelpAndSupportComponent from "../../components/home/HelpAndSupportComponent";
import { styles } from "../../theme";

export default function HelpAndSupport() {
  const [search, setSearch] = useState("");
  const [searchData, setSearchData] = useState(HelpAndSupportData);

  useEffect(() => {
    filterData();
  }, [search]);

  const filterData = () => {
    if (!!search) {
      const filteredData = HelpAndSupportData.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase())
      );
      setSearchData(filteredData);
    } else {
      setSearchData(HelpAndSupportData);
    }
  };

  const HelpAndSupportDesc = ({ item, index }) => {
    return (
      <HelpAndSupportComponent title={item.title} description={item.desc} />
    );
  };
  return (
    <CSafeAreaView>
      <CHeader title={strings.helpAndSupport} />
      <KeyBoardAvoidWrapper contentContainerStyle={localStyles.mainContainer}>
        <SearchComponent
          searchText={strings.search}
          value={search}
          setData={setSearch}
        />
        <FlatList
          data={searchData}
          renderItem={HelpAndSupportDesc}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          bounces={false}
          scrollEnabled={false}
        />
      </KeyBoardAvoidWrapper>
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  mainContainer: {
    ...styles.ph20,
    ...styles.pv10,
  },
});
