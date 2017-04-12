/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  CameraRoll,
  PermissionsAndroid,
  Platform,
  ListView,
  DataSource,
  TouchableHighlight,
  TouchableOpacity,
  Image
} from 'react-native';
import PhotoView from 'react-native-photo-view';


export default class CameraRollExample extends Component {

  constructor(props){
    super(props);
    this.photoList = [];
    const rowHasChanged = (r1, r2) => r1 !== r2;
    const ds = new ListView.DataSource({rowHasChanged});
    (this: any)._renderRow = this._renderRow.bind(this);
    (this: any)._renderSeparator = this._renderSeparator.bind(this);
    this.state = {
      dataSource: ds.cloneWithRows(this.photoList),
    }
  }

  clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
  }

  _renderRow(rowData, sectionID, rowID) {
    let onRowItemClick = () => {
      let photoListNew = [];

      this.setState({
        selectedImage: rowData.node.image
      })

      this.photoList.forEach((photo, index)=>{
        let photoNew = this.clone(photo);
        if(rowID == index){
          photoNew.isSelected = true;
        }else {
          photoNew.isSelected = false;
        }
        photoListNew.push(photoNew);
      })

      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(photoListNew),
      });
    }
    return (
      <TouchableOpacity onPress ={onRowItemClick} style={(rowData.isSelected && rowData.isSelected ==true) ? styles.selectedImageStyle : styles.nonSelectedImageStyle}>
        <Image
          source={rowData.node.image}
          style={styles.imageStyle}
        />
      </TouchableOpacity>
    );
  }

  _renderSeparator(sectionID, rowID){
   return (
     <View key={rowID} style={{width: 10}}/>
   );
 }

  getPhotoList = async () => {
    if (Platform.OS === 'android') {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Permission Explanation',
          message: 'CameraRollExample would like to access your pictures.',
        },
      );

      if (result == true) {
      }else {
        if (result !== 'granted') {
          alert('Access to pictures was denied.');
          return;
        }
      }
    }
    try {
      const data = await CameraRoll.getPhotos({
        first: 100000,
        assetType: 'Photos'
      });
      console.log(data);
      this.photoList = data.edges;
      if(this.photoList == null || this.photoList==undefined){
        this.photoList = [];
      }

      if(this.photoList.length > 0){
        this.photoList[0].isSelected = true;
      }

      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(this.photoList),
      });

      setTimeout(()=>{
        this.setState({
          selectedImage: (this.photoList.length > 0) ? this.photoList[0].node.image : null
        })
      }, 100);

    } catch (e) {
      console.log(e);
    }
  }

  componentWillMount(){
    this.getPhotoList();
  }

  render() {
    return (
      <View style={{flex:1, flexDirection: 'column', flexGrow:1}}>
        <View style={{flex:1, margin: 8 }} onLayout={(evt)=>{
            this.setState({
                imageContainerHeight: evt.nativeEvent.layout.height,
                imageContainerWidth: evt.nativeEvent.layout.width
            });
          }}
        >
        {this.state.selectedImage &&

          <PhotoView
            maximumZoomScale={6}
            minimumZoomScale={0.5}                                   
            onLoad={() => console.log("Image loaded!")}
            source={this.state.selectedImage}
            style={{width: this.state.imageContainerWidth, height: this.state.imageContainerHeight }}
          />
        }

        </View>
        <View style={{padding:8}}>
          <ListView showsHorizontalScrollIndicator={false}
            dataSource={this.state.dataSource}
            horizontal={true}
            enableEmptySections={true}
            renderRow={this._renderRow}
            renderSeparator={this._renderSeparator}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  imageStyle: {
    width: 150,
    height: 150
  },

  selectedImageStyle: {
    borderWidth: 2,
    borderColor: '#444444',
    padding: 4,
  },
  nonSelectedImageStyle: {
    padding: 4,
  }

});

AppRegistry.registerComponent('CameraRollExample', () => CameraRollExample);
