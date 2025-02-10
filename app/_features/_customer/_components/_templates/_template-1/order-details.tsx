"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useOpenDrawer } from "@/hooks/use-drawer";

export const OrderDetails = () => {
  const { isOpen, onClose } = useOpenDrawer();

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="h-[90vh] flex flex-col">
        <DrawerHeader>
          <DrawerTitle>Detalhes do Pedido</DrawerTitle>
          <DrawerDescription>
            Complete as informações restantes
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto p-5">
          <p>
            Urna quam ipsum purus si vitae pede lacus. Eleifend ultrices elit
            leo cubilia ut at in. Vel pretium elementum consectetur sagittis
            velit nam interdum ullamcorper. Tempus a dictumst blandit
            suspendisse mollis amet semper ornare consequat quisque. Condimentum
            fringilla suscipit eros morbi dis lectus dignissim ad vestibulum
            sodales. Iaculis tristique sapien non euismod vivamus. Elit
            pellentesque viverra auctor mauris finibus dignissim posuere
            tristique netus leo malesuada. Sagittis aptent ipsum laoreet a
            vivamus justo fames neque. Et maximus nullam scelerisque pharetra
            vitae pulvinar nisi phasellus. Fames montes penatibus fringilla
            mollis per habitasse quis. Gravida nisl ad facilisis fames nunc
            cursus penatibus turpis. Letius cubilia justo quis orci ornare
            metus. Elit fames ut egestas tellus eros tincidunt phasellus mus.
            Ante letius convallis lectus facilisis dictumst ut. Nulla urna
            rutrum fames phasellus lacinia nunc enim sapien sem himenaeos
            faucibus. Ornare erat nisi pulvinar duis maximus natoque tellus
            lobortis eget velit. Felis at aliquam potenti enim augue feugiat
            luctus in dictumst natoque placerat. Magna morbi vitae natoque
            finibus elementum orci nostra dolor lobortis consectetuer.
            Ullamcorper duis fringilla mattis consectetur condimentum. Ipsum ad
            efficitur dictumst elementum himenaeos pede phasellus proin dolor
            eleifend odio. Imperdiet praesent congue class dis justo montes elit
            gravida iaculis dictum. Lobortis est magnis purus ac lacinia a.
            Tempus morbi massa cras quis congue vehicula ut platea mi orci. Pede
            vitae sit nostra erat sagittis nec dignissim integer semper.
            Parturient ac hendrerit turpis lacinia primis sed eleifend feugiat
            ultricies fusce. Faucibus facilisi lectus consequat pulvinar ac
            dignissim sem. Nullam habitant faucibus molestie facilisi phasellus
            montes fames ultricies rutrum maecenas hendrerit. Eros rutrum
            consectetur fermentum vulputate pulvinar. Porta luctus elit lectus
            eu tortor ridiculus orci feugiat sollicitudin efficitur penatibus.
            Sapien auctor duis imperdiet ultricies neque mauris est cursus
            tempor scelerisque. Pulvinar senectus vulputate pretium facilisi
            nostra mauris ut dui iaculis. Purus venenatis nam vulputate velit
            hendrerit condimentum ligula ridiculus nibh. Inceptos vestibulum
            sollicitudin etiam eros diam netus sit neque penatibus. Vivamus
            gravida orci lacus vitae et convallis elit tristique mi. Vestibulum
            ad eros sapien lectus penatibus sociosqu. Erat nam ultrices placerat
            curabitur fringilla cursus gravida volutpat. Finibus urna class
            condimentum nec placerat donec ut congue cubilia. Sapien vel nulla
            adipiscing a per auctor phasellus facilisi. Imperdiet curae
            fermentum augue viverra ultricies. Maecenas class inceptos pretium
            morbi posuere sit. Semper himenaeos nam natoque posuere diam
            malesuada aliquet. Si placerat quisque vitae ornare amet quis
            aliquet urna venenatis felis volutpat. Efficitur tellus potenti
            purus commodo congue auctor odio suspendisse. Platea vivamus sit leo
            quam nec integer accumsan mollis sed conubia placerat. Morbi
            sociosqu id nam iaculis diam. Integer litora pede malesuada conubia
            faucibus velit netus ridiculus. Interdum ultrices tellus consequat
            fames ligula blandit luctus tempor non gravida semper. Tempor nec
            sagittis porta nam ultrices efficitur nostra. Rutrum praesent
            ullamcorper placerat fringilla commodo felis. Odio hac ut
            consectetur dui dapibus. Dapibus porta sit rutrum feugiat aenean
            conubia vivamus. Auctor magnis nisl ac torquent nostra erat inceptos
            ullamcorper vulputate arcu. Parturient congue fames montes libero
            ullamcorper dictum laoreet felis tempor hac est. Vehicula dapibus
            luctus sed quis enim dignissim nascetur. Nullam luctus quam purus
            consectetuer pellentesque auctor accumsan eleifend pede.
          </p>
        </div>
        <DrawerFooter>
          <Button>Finalizar</Button>
          <DrawerClose asChild>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
