import "./Portfolio.css";
import { ReactComponent as Infoicon } from "../components/asset/info_icon.svg";
import { ReactComponent as Walleticon } from "../components/asset/wallet_icon.svg";
import { ReactComponent as ETHicon } from "../components/asset/ETH_Token_icon.svg";
import { ReactComponent as AVAXicon } from "../components/asset/AVAX_Token_icon.svg";
import { ReactComponent as SendIcon } from "../components/asset/send_icon.svg";
import { ReactComponent as ReceiveIcon } from "../components/asset/receive-icon.svg";
import { ReactComponent as QuiTokenIcon } from "../components/asset/quitoken_icon.svg";
import { Link } from "react-router-dom";
import { NftInfo } from "../models/NftInfo";
import { useNftInfo } from "../hooks/useNftInfo";
import { useHoldingInfo } from "../hooks/useHoldingInfo";
import { useWalletInfo } from "../hooks/useWalletInfo";

function Portfolio({ currentAccount, setCurrentPage }: any) {
  setCurrentPage("portfolio");
  const tokenList = useNftInfo(currentAccount);
  const holdingInfo = useHoldingInfo(currentAccount);
  const walletInfo = useWalletInfo(currentAccount);

  return (
    <div>
      <section className="totalBalance_wrap">
        <div className="totalBalance">
          <div className="tb_title">
            <span className="tb_title_main QUINOAheadline5">Total Balance</span>
            <Infoicon className="info_Icon"></Infoicon>
          </div>

          <div className="tb_contents_wrap">
            <div className="tb_contents_main">
              <div className="tb_balance">
                <Walleticon className="wallet_Icon"></Walleticon>
                <div className="QUINOAheadline2">
                  <span className="text_color_900">
                    $
                    {
                      (
                        walletInfo.reduce((acc, cv) => {
                          return acc + cv.balance;
                        }, 0) + (holdingInfo?.totalHoldings || 0)
                      )
                        .toFixed(2)
                        .split(".")[0]
                    }
                  </span>
                  <span className="text_color_100">
                    .
                    {
                      (
                        walletInfo.reduce((acc, cv) => {
                          return acc + cv.balance;
                        }, 0) + (holdingInfo?.totalHoldings || 0)
                      )
                        .toFixed(2)
                        .split(".")[1]
                    }
                  </span>
                </div>
              </div>
              <div className="tb_buttons">
                <div className="tb_contents_bnt cursor_pointer">
                  <p>
                    <SendIcon className="tb_contents_bnt_icon"></SendIcon>
                  </p>
                  <p>
                    <span className="tb_contents_bnt_text">Send</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="tb_contents_sub">
              available : $
              {walletInfo
                .reduce((acc, cv) => {
                  return acc + cv.balance;
                }, 0)
                .toFixed(2)}
            </div>
          </div>
        </div>

        <div className="walletList">
          <div className="wl_table">
            <header className="wl_table_header">
              <div className="list_Rowheader">
                <p className="header_Tokens">Tokens in wallet</p>
                <p className="header_Balance">Balance</p>
                <p className="header_Amount">Amount</p>
              </div>
            </header>
            <div className="header_line"></div>
            {/* 1st */}
            {walletInfo.map((item) => (
              <div className="list_tokens">
                <div className="ls_tokenname_wrap">
                  <div className="list_token_name">
                    <img src={item.logo} className="ls_token_icon" />
                    <span className="ls_name_title QUINOABody-2">
                      {item.symbol}
                    </span>
                  </div>
                </div>
                <div className="ls_tokenbalance_wrap">
                  <div className="list_token_balance">
                    <span className="ls_token_balance QUINOABody-2">
                      ${item.balance.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="ls_tokenamount_wrap">
                  <div className="list_token_amount">
                    <span className="ls_token_amount QUINOABody-2">
                      {item.amount}
                    </span>
                  </div>
                </div>
                <div className="ls_underline"></div>
              </div>
            ))}
          </div>
          <div className="lt_moreBtn">
            <span className="moreBtn_txt">
              Load more<div className="moreBtn_arrow"></div>
            </span>
          </div>
        </div>
      </section>

      <section className="myInvestment_wrap">
        <div className="myInvestmentViewer">
          <div className="mIV_title">
            <div>
              <span className="mIV_title_main QUINOAheadline5">
                My Investments
              </span>
            </div>
            <span className="mIV_title_sub QUINOABody-3">
              San Franciscan contrarian Conference attendee Out of touch.
            </span>
          </div>

          <div className="myInvestment_contents_wrap">
            <div className="myTotal_Contents">
              <div className="mTC_title QUINOASubTitle-1">Total Holdings</div>
              <div className="mTC_contents QUINOAheadline4">
                <span className="text_color_900">
                  ${(holdingInfo?.totalHoldings || 0).toFixed(2).split(".")[0]}
                </span>
                <span className="text_color_100">
                  .{(holdingInfo?.totalHoldings || 0).toFixed(2).split(".")[1]}
                </span>
              </div>
              <div className="text_color_green300">+ $132,204.52 (5.26%)</div>
            </div>
            <div className="myTotal_Contests_Splitter" />
            <div className="myTotal_Contents">
              <div className="mTC_title QUINOASubTitle-1">Total Earnings</div>
              <div className="mTC_contents QUINOAheadline4">
                <span className="text_color_900">$132,204</span>
                <span className="text_color_100">.52</span>
              </div>
              <div>
                <span className="text_color_200">Est. yearly </span>
                <span className="text_color_green300">+ $12.201 (1.26%)</span>
              </div>
            </div>
            <div className="myTotal_Contests_Splitter" />
            <div className="myTotal_Contents">
              <div className="mTC_title QUINOASubTitle-1">
                <QuiTokenIcon className="quiToken"></QuiTokenIcon>QUI Tokens
              </div>
              <div className="mTC_contents QUINOAheadline4">
                <span className="text_color_900">
                  {(holdingInfo?.quiTokens || 0).toFixed(2).split(".")[0]}
                </span>
                <span className="text_color_100">
                  .{(holdingInfo?.quiTokens || 0).toFixed(2).split(".")[1]}
                </span>
              </div>
              <div className="text_color_200">
                USD {((holdingInfo?.quiTokens || 0) * 0.5).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
        <div className="myInvestmentList">
          <div className="mIL_title_wrap">
            <div className="mIL_title">Investment Lists</div>
            <div className="mIL_splitter_main"></div>
            <div className="mIL_splitter_sub"></div>
          </div>
          <div className="sortingBox_wrap">
            <div className="sortingTxt_wrap">
              <div className="sbIcon"></div>
              <span className="sortingTxt">APY: High to Low</span>
            </div>
            <img src="/img/arcordian_default.png" className="arcordian" />
            <div className="sortingBox_dropDown">
              <div className="slist_focused">
                <span className="apyHtoL_txt txt">APY: High to Low</span>
              </div>
              <div className="slist">
                <span className="apyLtoH_txt txt">APY: Low to High</span>
              </div>
              <div className="slist">
                <span className="holdingHtoL_txt txt">
                  Holding: High to Low
                </span>
              </div>
              <div className="slist">
                <span className="holdingLtoH_txt txt">
                  Holding: Low to High
                </span>
              </div>
            </div>
          </div>
          <div className="listviewToggle_wrap">
            {/* <input type="checkbox" id="toggle" hidden />
            <label htmlFor="toggle" className="lvToggle_label_wrap">
              <span className="ivtoggleBtn"></span>
            </label> */}
            <label className="lvToggle">
              <input type="checkbox" className="lvInput" />
              <span className="ivInput_slider"></span>
            </label>
          </div>
          <div className="mIL_lists_wrap">
            {/* NFT Row #2 */}
            <div className="mIL_lists_row">
              {tokenList.map((item: NftInfo) => (
                <Link
                  to={"../investing/detail/" + item.vaultInfo.address}
                  state={{
                    assetAddress: item.vaultInfo.asset,
                    vaultInfo: item.vaultInfo,
                    svg: item.nftSvg,
                  }}
                  style={{ textDecoration: "none" }}
                  className="mIL_lists_NFT"
                >
                  <div className="NFT_headline">
                    <div className="NFT_dac_name">
                      By {item.vaultInfo.dacName}
                    </div>
                    <div className="NFT_investments_desc">
                      <div className="NFT_investmetns_name">
                        {item.vaultInfo.name}
                      </div>
                      <div className="NFT_sTtoken_list">
                        <img
                          src="img/STtoken_img_01.svg"
                          className="sTtoken_img"
                        />
                        <img
                          src="img/STtoken_img_02.svg"
                          className="sTtoken_img"
                        />
                        <img
                          src="img/STtoken_img_03.svg"
                          className="sTtoken_img"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="NFT_Img_wrap">
                    <object
                      type="image/svg+xml"
                      className="NFT_Img"
                      data={item.nftSvg}
                    />
                  </div>
                </Link>
              ))}
            </div>
            <div className="mi_table">
              <header className="mi_table_header">
                <div className="list_Rowheader">
                  <p className="header_Product">Product</p>
                  <p className="header_Professionals">Professionals</p>
                  <p className="header_APY">APY</p>
                  <p className="header_Holding">Holding</p>
                  <p className="header_Earning">Earning</p>
                  <p className="header_totalVolume">Total Volume</p>
                </div>
              </header>
              <div className="header_line"></div>
              <div className="list_strategy">
                <div className="ls_strategyname_wrap">
                  <div className="list_Strategy_name">
                    <div className="ls_name_title">JENN yield project</div>
                    <div className="ls_STtoken">
                      <img
                        src="img/STtoken_img_01.svg"
                        className="sTtoken_img"
                      />
                      <img
                        src="img/STtoken_img_02.svg"
                        className="sTtoken_img"
                      />
                      <img
                        src="img/STtoken_img_03.svg"
                        className="sTtoken_img"
                      />
                    </div>
                  </div>
                </div>
                <div className="list_professionals">
                  <div className="list_professionals_inner">
                    <div className="lpIcon">
                      <img src="/img/daoicon_01.svg" />
                    </div>
                    <span className="lp_txt QUINOABody-2">
                      SuperMachine DAC
                    </span>
                  </div>
                </div>
                <div className="apy_number_wrap">
                  <div className="apy_number">
                    <div className="apy_down"></div>
                    <span className="apy_number_txt_down">
                      8.9<span className="percent_bold">%</span>
                    </span>
                  </div>
                </div>
                <div className="holding_wrap">
                  <span className="holding QUINOABody-1">$246.7K</span>
                </div>
                <div className="earning_wrap">
                  <span className="earning QUINOABody-1">$2,346.7M</span>
                </div>
                <div className="totalvolume_wrap">
                  <span className="totalvolume QUINOABody-1">$2,346.7M</span>
                </div>
                <div className="ls_underline"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Portfolio;
