/**
 * Created by Jwill on 16/10/12.
 */
import { Menu, Dropdown, Button, Icon } from 'antd';
import React, { Component, PropTypes } from 'react';

export default class DropDownList extends Component {

  static propTypes = {
    listArray: PropTypes.array.isRequired,
  }

  render() {
    const interests = this.props.listArray;
    const SubMenu = Menu.SubMenu;
    const mappedInt = interests.map(interest => <Menu.Item key={interest.id}>{interest.interest_name}</Menu.Item>);
    const menu = (
      <Menu>
        {mappedInt}
        <SubMenu title="item 1">
          <Menu.Item>item 1.1</Menu.Item>
          <Menu.Item>item 1.2</Menu.Item>
        </SubMenu>
      </Menu>
    );

    return (
      <Dropdown overlay={menu}>
        <Button type="ghost" style={{ marginLeft: 8 }}>
          Button <Icon type="down" />
        </Button>
      </Dropdown>
    );
  }
}
